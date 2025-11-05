import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';

import { useBasic, useTextareaResize } from '@/hooks/use-basic';
import {
    split_by_comma, join_with_comma,
    trim_line_space, remove_empty_line, split_by_blank, join_by_blank, sperate_with_blank_row,
    add_quote, remove_quote, add_single_quote, remove_single_quote, uniq_line, shuffle_line,
    add_comma_suffix, remove_comma_suffix,
    nums_average, nums_max, nums_min,
    sort_asc, sort_desc, sort_len_asc, sort_len_desc,
    regex_filter_lines, regex_extract_lines, predefined_regex_list, text_replace,
    to_upper_case, to_lower_case, to_camel_case, to_snake_case, to_kebab_case, to_const_case,
    space_to_tab,toggle_prefix,toggle_suffix,trim_different,
} from './utils';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const TextProcPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('', 'textproc');

    const [regexValue, setRegexValue] = useState('');
    const [replaceSourceValue, setReplaceSourceValue] = useState('');
    const [replaceDestinationValue, setReplaceDestinationValue] = useState('');
    const [prefixSuffixValue, setPrefixSuffixValue] = useState('');

    const [statisticsShow, setStatisticsShow] = useState(false);
    const handleStatisticsDialogClose = () => setStatisticsShow(false);

    const valueLines = useMemo(() => value.split('\n').map((x: string) => x.trim()).filter((x: string) => x.length > 0), [value]);
    const valueLinesLength = useMemo(() => valueLines.map((x: string) => x.length), [valueLines]);

    const { rows, textareaRef } = useTextareaResize('textproc', 15);

    const memory_load = () => {
        if (confirm('是否使用存储区的内容替换当前内容?')) {
            setValue(localStorage.getItem("textproc_memory") ?? '');
        }
    }
    const memory_save = () => {
        localStorage.setItem("textproc_memory", value);
        toast.info('已保存到存储区', { autoClose: 3000 });
    }

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
            'text/html': new Blob([htmlTable], { type: 'text/html' })
        });

        navigator.clipboard.write([clipboardItem]).then(() => {
            toast.info('已复制表格内容到剪贴板！', { autoClose: 10000 });
        }).catch((err) => {
            toast.error(String(err), { autoClose: 10000 });
        });
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
                className='scrollable-textarea textarea-font'
            />

            <ButtonToolbar>
                {functionButtonGroup}
            </ButtonToolbar>

            <InputGroup className="mt-2">
                <Dropdown>
                    <Dropdown.Toggle variant="light" className="border">正则表达式</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {predefined_regex_list.map(item => <Dropdown.Item onClick={() => setRegexValue(item.value)} key={item.key}>{item.key}</Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>

                <Form.Control onChange={e => setRegexValue(e.target.value)} value={regexValue} spellCheck={false} />
                <Button variant="light" className="border" onClick={action(regex_filter_lines(regexValue, false))} title="保留符合正则的行">包含</Button>
                <Button variant="light" className="border" onClick={action(regex_filter_lines(regexValue, true))} title="删除符合正则的行">排除</Button>
                <Button variant="light" className="border" onClick={action(regex_extract_lines(regexValue))} title="提取正则匹配到的组为 Excel 文本">提取</Button>

            </InputGroup>
            <InputGroup className="mt-2">
                <Form.Control onChange={e => setReplaceSourceValue(e.target.value)} spellCheck={false} />
                <InputGroup.Text>替换为</InputGroup.Text>
                <Form.Control onChange={e => setReplaceDestinationValue(e.target.value)} spellCheck={false} />
                <Button variant="light" className="border" onClick={action(text_replace(replaceSourceValue, replaceDestinationValue))}>替换</Button>
            </InputGroup>
            <InputGroup className="mt-2">
                <Button variant="light" className="border" title="移除公共前后缀" onClick={action(trim_different)}>智能剥离</Button>
                <Form.Control onChange={e => setPrefixSuffixValue(e.target.value)} spellCheck={false} />
                <Button variant="light" className="border" onClick={action(toggle_prefix(prefixSuffixValue))}>前缀</Button>
                <Button variant="light" className="border" onClick={action(toggle_suffix(prefixSuffixValue))}>后缀</Button>
            </InputGroup>

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

            <Modal show={statisticsShow} onHide={handleStatisticsDialogClose} centered>
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
        </>
    )
}

export default TextProcPage;
