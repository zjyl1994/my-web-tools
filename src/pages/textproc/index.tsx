import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Form, Button, InputGroup, ButtonGroup, ButtonToolbar, Modal } from '@/components/ui';
import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import { useInputHistory } from '@/hooks/use-input-history';
import {
    split_by_comma, join_with_comma,
    trim_line_space, remove_empty_line, split_by_blank, join_by_blank, sperate_with_blank_row,
    add_quote, remove_quote, add_single_quote, remove_single_quote, uniq_line, shuffle_line,
    add_comma_suffix, remove_comma_suffix,
    nums_average, nums_max, nums_min,
    sort_asc, sort_desc, sort_len_asc, sort_len_desc,
    regex_filter_lines, regex_extract_lines, predefined_regex_list, text_replace,
    to_upper_case, to_lower_case, to_camel_case, to_snake_case, to_kebab_case, to_const_case,
    space_to_tab, csv_comma_to_tab, toggle_prefix, toggle_suffix, common_prefix, common_suffix, split_line_by, join_line_by,
} from './utils';

const TextProcPage: React.FC = () => {
    const {
        value,
        setValue,
        action,
        functionButtonGroup,
    } = useBasic('', 'textproc');

    const [regexValue, setRegexValue] = useState('');
    const { history: regexHistory, remember: rememberRegex } = useInputHistory('textproc.regex');
    const [replaceSourceValue, setReplaceSourceValue] = useState('');
    const [replaceDestinationValue, setReplaceDestinationValue] = useState('');
    const { history: replaceFromHistory, remember: rememberReplaceFrom } = useInputHistory('textproc.replace.from');
    const { history: replaceToHistory, remember: rememberReplaceTo } = useInputHistory('textproc.replace.to');
    const [prefixValue, setPrefixValue] = useState('');
    const { history: prefixHistory, remember: rememberPrefix } = useInputHistory('textproc.prefix');
    const [suffixValue, setSuffixValue] = useState('');
    const { history: suffixHistory, remember: rememberSuffix } = useInputHistory('textproc.suffix');
    const [splitJoinValue, setSplitJoinValue] = useState('');
    const { history: splitJoinHistory, remember: rememberSplitJoin } = useInputHistory('textproc.splitJoin');

    const [statisticsShow, setStatisticsShow] = useState(false);
    const [regexDialogShow, setRegexDialogShow] = useState(false);
    const [replaceDialogShow, setReplaceDialogShow] = useState(false);
    const [affixDialogShow, setAffixDialogShow] = useState(false);
    const [splitJoinDialogShow, setSplitJoinDialogShow] = useState(false);

    const exec = (effect: (data: string) => (string | Promise<string>), remember?: () => void) => () => {
        if (remember) {
            remember();
        }
        action(effect)();
    };

    const valueLines = useMemo(
        () => value.split('\n').map((x: string) => x.trim()).filter((x: string) => x.length > 0),
        [value],
    );
    const valueLinesLength = useMemo(() => valueLines.map((x: string) => x.length), [valueLines]);

    const { rows, textareaRef } = useTextareaResize('textproc', 15);

    const memory_load = () => {
        if (confirm('是否使用存储区的内容替换当前内容?')) {
            setValue(localStorage.getItem('textproc_memory') ?? '');
        }
    };

    const memory_save = () => {
        localStorage.setItem('textproc_memory', value);
        toast.info('已保存到存储区', { autoClose: 3000 });
    };

    const copy_as_table = () => {
        const rows = value.split('\n').map(row => row.split('\t'));
        const htmlTable = `
        <table border="1" style="border-collapse:collapse;">
        ${rows.map(row => `
            <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
        `).join('')}
        </table>
        `.trim();
        const clipboardItem = new ClipboardItem({
            'text/plain': new Blob([value], { type: 'text/plain' }),
            'text/html': new Blob([htmlTable], { type: 'text/html' }),
        });

        navigator.clipboard.write([clipboardItem]).then(() => {
            toast.info('已复制表格内容到剪贴板！', { autoClose: 10000 });
        }).catch((err) => {
            toast.error(String(err), { autoClose: 10000 });
        });
    };

    const detectAffixes = () => {
        const lines = value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            setPrefixValue('');
            setSuffixValue('');
            return;
        }

        setPrefixValue(common_prefix(lines));
        setSuffixValue(common_suffix(lines));
    };

    return (
        <>
            <Form.Control
                as="textarea"
                ref={textareaRef}
                rows={rows}
                spellCheck={false}
                value={value}
                onChange={e => setValue(e.target.value)}
                className="scrollable-textarea textarea-font"
            />

            <ButtonToolbar>
                {functionButtonGroup}
                <ButtonGroup>
                    <Button variant="light" className="border" onClick={() => setRegexDialogShow(true)}>正则</Button>
                    <Button variant="light" className="border" onClick={() => setReplaceDialogShow(true)}>替换</Button>
                    <Button variant="light" className="border" onClick={() => setAffixDialogShow(true)}>前后缀</Button>
                    <Button variant="light" className="border" onClick={() => setSplitJoinDialogShow(true)}>切行/合行</Button>
                </ButtonGroup>
            </ButtonToolbar>

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(split_by_comma)} title="根据逗号切割成好多行">逗号切行</Button>
                    <Button variant="light" className="border" onClick={action(join_with_comma)} title="逗号分隔合并所有行">逗号合行</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(remove_quote)} title="行两边删除双引号">去双引号</Button>
                    <Button variant="light" className="border" onClick={action(add_quote)} title="行两边添加双引号">加双引号</Button>
                    <Button variant="light" className="border" onClick={action(remove_single_quote)} title="行两边删除单引号">去单引号</Button>
                    <Button variant="light" className="border" onClick={action(add_single_quote)} title="行两边添加单引号">加单引号</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(add_comma_suffix)} title="行尾追加逗号">行尾加逗号</Button>
                    <Button variant="light" className="border" onClick={action(remove_comma_suffix)} title="行尾删除逗号">行尾去逗号</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(split_by_blank)} title="根据空白切割成好多行">空白切行</Button>
                    <Button variant="light" className="border" onClick={action(join_by_blank)} title="用空格合并所有行">空白合行</Button>
                    <Button variant="light" className="border" onClick={action(trim_line_space)} title="删除行两边的空白">去除两边空白</Button>
                    <Button variant="light" className="border" onClick={action(sperate_with_blank_row)} title="两行中间增加空行">空白隔行</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(space_to_tab)} title="连续空白转为制表符">空白拆表</Button>
                    <Button variant="light" className="border" onClick={action(csv_comma_to_tab)} title="CSV逗号拆表">CSV逗号拆表</Button>
                    <Button variant="light" className="border" onClick={copy_as_table} title="复制Tab分割为表格">复制表格</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(remove_empty_line)} title="删除只有空白没有内容的行">去除空行</Button>
                    <Button variant="light" className="border" onClick={action(uniq_line)} title="删除重复的行">去除重复行</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(sort_asc)} title="a在前z在后">字典升序排序</Button>
                    <Button variant="light" className="border" onClick={action(sort_desc)} title="z在前a在后">字典降序排序</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(to_upper_case)} title="UPPER CASE">大写</Button>
                    <Button variant="light" className="border" onClick={action(to_lower_case)} title="lower case">小写</Button>
                    <Button variant="light" className="border" onClick={action(to_camel_case)} title="camelCase">驼峰</Button>
                    <Button variant="light" className="border" onClick={action(to_snake_case)} title="snake_case">蛇形</Button>
                    <Button variant="light" className="border" onClick={action(to_kebab_case)} title="kebab-case">烤串</Button>
                    <Button variant="light" className="border" onClick={action(to_const_case)} title="CONST_CASE">大蛇</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(sort_len_asc)} title="短在前长在后">长度升序排序</Button>
                    <Button variant="light" className="border" onClick={action(sort_len_desc)} title="长在前短在后">长度降序排序</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={action(shuffle_line)} title="随机洗牌打乱所有行的顺序">随机排序</Button>
                    <Button variant="light" className="border" onClick={() => setStatisticsShow(true)} title="行平均长度等信息">行统计</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={memory_save} title="暂存当前结果">记忆存</Button>
                    <Button variant="light" className="border" onClick={memory_load} title="拿出存的结果">记忆取</Button>
                </ButtonGroup>
            </ButtonToolbar>

            <Modal show={statisticsShow} onHide={() => setStatisticsShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>统计</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>总长度 {value.length}</div>
                    <div>总行数 {valueLines.length}</div>
                    <div>最长行长度 {nums_max(valueLinesLength)}</div>
                    <div>最短行长度 {nums_min(valueLinesLength)}</div>
                    <div>平均行长度 {nums_average(valueLinesLength).toFixed(2)}</div>
                </Modal.Body>
            </Modal>

            <Modal show={regexDialogShow} onHide={() => setRegexDialogShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>正则表达式</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>预设</Form.Label>
                        <select
                            className="ui-control"
                            defaultValue=""
                            onChange={e => {
                                if (e.target.value) {
                                    setRegexValue(e.target.value);
                                }
                            }}
                        >
                            <option value="">选择预设正则</option>
                            {predefined_regex_list.map(item => (
                                <option value={item.value} key={item.key}>
                                    {item.key}
                                </option>
                            ))}
                        </select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>正则表达式</Form.Label>
                        <InputGroup>
                            <Form.Control
                                list="regex-history"
                                onChange={e => setRegexValue(e.target.value)}
                                value={regexValue}
                                spellCheck={false}
                                placeholder="输入正则表达式"
                            />
                        </InputGroup>
                        <datalist id="regex-history">
                            {[...new Set([...regexHistory, ...predefined_regex_list.map(i => i.value)])].map(v => (
                                <option value={v} key={v} />
                            ))}
                        </datalist>
                    </Form.Group>
                    <ButtonToolbar>
                        <Button variant="light" className="border" onClick={exec(regex_filter_lines(regexValue, false), () => rememberRegex(regexValue))} title="保留符合正则的行">保留匹配行</Button>
                        <Button variant="light" className="border" onClick={exec(regex_filter_lines(regexValue, true), () => rememberRegex(regexValue))} title="删除符合正则的行">删除匹配行</Button>
                        <Button variant="light" className="border" onClick={exec(regex_extract_lines(regexValue), () => rememberRegex(regexValue))} title="提取正则匹配到的组为 Excel 文本">提取匹配内容</Button>
                    </ButtonToolbar>
                </Modal.Body>
            </Modal>

            <Modal show={replaceDialogShow} onHide={() => setReplaceDialogShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>文本替换</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>查找内容</Form.Label>
                        <Form.Control
                            list="replace-from-history"
                            value={replaceSourceValue}
                            onChange={e => setReplaceSourceValue(e.target.value)}
                            spellCheck={false}
                            placeholder="输入待替换文本"
                        />
                        <datalist id="replace-from-history">
                            {replaceFromHistory.map(v => (<option value={v} key={v} />))}
                        </datalist>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>替换为</Form.Label>
                        <Form.Control
                            list="replace-to-history"
                            value={replaceDestinationValue}
                            onChange={e => setReplaceDestinationValue(e.target.value)}
                            spellCheck={false}
                            placeholder="输入替换结果"
                        />
                        <datalist id="replace-to-history">
                            {replaceToHistory.map(v => (<option value={v} key={v} />))}
                        </datalist>
                    </Form.Group>
                    <ButtonToolbar>
                        <Button
                            variant="light"
                            className="border"
                            onClick={exec(
                                text_replace(replaceSourceValue, replaceDestinationValue),
                                () => {
                                    rememberReplaceFrom(replaceSourceValue);
                                    rememberReplaceTo(replaceDestinationValue);
                                },
                            )}
                        >
                            执行文本替换
                        </Button>
                    </ButtonToolbar>
                </Modal.Body>
            </Modal>

            <Modal show={affixDialogShow} onHide={() => setAffixDialogShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>前后缀处理</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>前缀</Form.Label>
                        <Form.Control
                            list="prefix-history"
                            value={prefixValue}
                            onChange={e => setPrefixValue(e.target.value)}
                            spellCheck={false}
                            placeholder="输入前缀"
                        />
                        <datalist id="prefix-history">
                            {prefixHistory.map(v => (<option value={v} key={v} />))}
                        </datalist>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>后缀</Form.Label>
                        <Form.Control
                            list="suffix-history"
                            value={suffixValue}
                            onChange={e => setSuffixValue(e.target.value)}
                            spellCheck={false}
                            placeholder="输入后缀"
                        />
                        <datalist id="suffix-history">
                            {suffixHistory.map(v => (<option value={v} key={v} />))}
                        </datalist>
                    </Form.Group>
                    <ButtonToolbar>
                        <Button variant="light" className="border" onClick={detectAffixes}>智能检测前后缀</Button>
                        <Button variant="light" className="border" onClick={exec(toggle_prefix(prefixValue), () => rememberPrefix(prefixValue))}>添加或移除前缀</Button>
                        <Button variant="light" className="border" onClick={exec(toggle_suffix(suffixValue), () => rememberSuffix(suffixValue))}>添加或移除后缀</Button>
                    </ButtonToolbar>
                </Modal.Body>
            </Modal>

            <Modal show={splitJoinDialogShow} onHide={() => setSplitJoinDialogShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>按分隔符切行 / 合行</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>分隔符</Form.Label>
                        <Form.Control
                            list="split-join-history"
                            value={splitJoinValue}
                            onChange={e => setSplitJoinValue(e.target.value)}
                            spellCheck={false}
                            placeholder="输入切行或合行使用的分隔符"
                        />
                        <datalist id="split-join-history">
                            {splitJoinHistory.map(v => (<option value={v} key={v} />))}
                        </datalist>
                    </Form.Group>
                    <ButtonToolbar>
                        <Button variant="light" className="border" onClick={exec(split_line_by(splitJoinValue), () => rememberSplitJoin(splitJoinValue))}>按分隔符切分为多行</Button>
                        <Button variant="light" className="border" onClick={exec(join_line_by(splitJoinValue), () => rememberSplitJoin(splitJoinValue))}>按分隔符合并为一行</Button>
                    </ButtonToolbar>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default TextProcPage;
