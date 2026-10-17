import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Form, Button, InputGroup, ButtonToolbar, Modal, Dropdown } from '@/components/ui';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import CodeEditor from '@/components/ui/code-editor';
import EditorActions from '@/components/ui/editor-actions';
import './style.css';
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
    const [memoryConfirmOpen, setMemoryConfirmOpen] = useState(false);

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

    const { rows, textareaRef } = useTextareaResize<HTMLDivElement>('textproc', 15);

    const memory_load = () => {
        setValue(localStorage.getItem('textproc_memory') ?? '');
        setMemoryConfirmOpen(false);
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
            toast.info('已复制表格内容', { autoClose: 3000 });
        }).catch((error) => {
            console.error(error);
            toast.error('无法写入剪贴板，请检查浏览器的剪贴板权限后重试。', { autoClose: 6000 });
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
            <CodeEditor
                ariaLabel="待处理的文本"
                value={value}
                onChange={setValue}
                rows={rows}
                resizeRef={textareaRef}
            />

            <div className="textproc-actions">
                <EditorActions editing={<>
                    {functionButtonGroup}
                    <Button variant="light" className="border" onClick={memory_save} title="暂存当前结果">暂存内容</Button>
                    <Button variant="light" className="border" onClick={() => setMemoryConfirmOpen(true)} title="用暂存内容替换当前文本">恢复暂存</Button>
                </>}>
                    <div className="textproc-primary-actions" role="group" aria-label="常用文本处理">
                        <Button variant="light" className="border" onClick={action(uniq_line)}>去除重复行</Button>
                        <Button variant="light" className="border" onClick={action(remove_empty_line)}>去除空行</Button>
                        <Button variant="light" className="border" onClick={() => setReplaceDialogShow(true)}>文本替换</Button>
                        <Dropdown>
                            <Dropdown.Toggle className="border">排序 ▾</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={action(sort_asc)} title="a在前z在后">字典升序排序</Dropdown.Item>
                                <Dropdown.Item onClick={action(sort_desc)} title="z在前a在后">字典降序排序</Dropdown.Item>
                                <Dropdown.Item onClick={action(sort_len_asc)} title="短在前长在后">长度升序排序</Dropdown.Item>
                                <Dropdown.Item onClick={action(sort_len_desc)} title="长在前短在后">长度降序排序</Dropdown.Item>
                                <Dropdown.Item onClick={action(shuffle_line)} title="随机洗牌打乱所有行的顺序">随机排序</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className="textproc-category-actions" role="group" aria-label="更多文本处理">
                        <Dropdown>
                            <Dropdown.Toggle className="border">拆分合并 ▾</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setSplitJoinDialogShow(true)} title="自定义分隔符切行或合行">自定义切合行</Dropdown.Item>
                                <Dropdown.Item onClick={action(split_by_comma)} title="根据逗号切割成好多行">逗号切行</Dropdown.Item>
                                <Dropdown.Item onClick={action(join_with_comma)} title="逗号分隔合并所有行">逗号合行</Dropdown.Item>
                                <Dropdown.Item onClick={action(split_by_blank)} title="根据空白切割成好多行">空白切行</Dropdown.Item>
                                <Dropdown.Item onClick={action(join_by_blank)} title="用空格合并所有行">空白合行</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle className="border">符号与前后缀 ▾</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setAffixDialogShow(true)} title="智能检测、自定义前后缀">自定义前后缀</Dropdown.Item>
                                <Dropdown.Item onClick={action(remove_quote)} title="行两边删除双引号">去双引号</Dropdown.Item>
                                <Dropdown.Item onClick={action(add_quote)} title="行两边添加双引号">加双引号</Dropdown.Item>
                                <Dropdown.Item onClick={action(remove_single_quote)} title="行两边删除单引号">去单引号</Dropdown.Item>
                                <Dropdown.Item onClick={action(add_single_quote)} title="行两边添加单引号">加单引号</Dropdown.Item>
                                <Dropdown.Item onClick={action(add_comma_suffix)} title="行尾追加逗号">行尾加逗号</Dropdown.Item>
                                <Dropdown.Item onClick={action(remove_comma_suffix)} title="行尾删除逗号">行尾去逗号</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle className="border">命名转换 ▾</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={action(to_upper_case)} title="转为大写">UPPERCASE</Dropdown.Item>
                                <Dropdown.Item onClick={action(to_lower_case)} title="转为小写">lowercase</Dropdown.Item>
                                <Dropdown.Item onClick={action(to_camel_case)} title="转为驼峰命名">camelCase</Dropdown.Item>
                                <Dropdown.Item onClick={action(to_snake_case)} title="转为下划线命名">snake_case</Dropdown.Item>
                                <Dropdown.Item onClick={action(to_kebab_case)} title="转为短横线命名">kebab-case</Dropdown.Item>
                                <Dropdown.Item onClick={action(to_const_case)} title="转为大写下划线命名">SNAKE_CASE</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle className="border">更多 ▾</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={action(trim_line_space)} title="删除行两边的空白">去除两边空白</Dropdown.Item>
                                <Dropdown.Item onClick={action(sperate_with_blank_row)} title="两行中间增加空行">空白隔行</Dropdown.Item>
                                <Dropdown.Item onClick={action(space_to_tab)} title="连续空白转为制表符">空白拆表</Dropdown.Item>
                                <Dropdown.Item onClick={action(csv_comma_to_tab)} title="CSV逗号拆表">CSV逗号拆表</Dropdown.Item>
                                <Dropdown.Item onClick={copy_as_table} title="复制Tab分割为表格">复制表格</Dropdown.Item>
                                <Dropdown.Item onClick={() => setRegexDialogShow(true)}>正则筛选与提取</Dropdown.Item>
                                <Dropdown.Item onClick={() => setStatisticsShow(true)}>行统计</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </EditorActions>
            </div>

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
                        <Form.Label htmlFor="textproc-field-1">预设</Form.Label>
                        <select id="textproc-field-1"
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
                        <Form.Label htmlFor="textproc-field-2">正则表达式</Form.Label>
                        <InputGroup>
                            <Form.Control id="textproc-field-2"
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
                        <Form.Label htmlFor="textproc-field-3">查找内容</Form.Label>
                        <Form.Control id="textproc-field-3"
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
                        <Form.Label htmlFor="textproc-field-4">替换为</Form.Label>
                        <Form.Control id="textproc-field-4"
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
                        <Form.Label htmlFor="textproc-field-5">前缀</Form.Label>
                        <Form.Control id="textproc-field-5"
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
                        <Form.Label htmlFor="textproc-field-6">后缀</Form.Label>
                        <Form.Control id="textproc-field-6"
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
                        <Form.Label htmlFor="textproc-field-7">分隔符</Form.Label>
                        <Form.Control id="textproc-field-7"
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

            <ConfirmDialog
                open={memoryConfirmOpen}
                title="恢复暂存内容"
                message="暂存区的内容会覆盖当前文本，覆盖后仍可用「撤销」恢复。"
                confirmLabel="恢复暂存"
                onConfirm={memory_load}
                onCancel={() => setMemoryConfirmOpen(false)}
            />
        </>
    );
};

export default TextProcPage;
