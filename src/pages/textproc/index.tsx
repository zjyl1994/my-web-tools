import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Modal from 'react-bootstrap/Modal';

import { useBasic } from '@/hooks/use-basic';
import {
    split_by_comma, join_with_comma,
    trim_line_space, remove_empty_line, split_by_blank,
    add_quote, remove_quote, uniq_line,
    add_comma_suffix, remove_comma_suffix,
    nums_average, nums_max, nums_min,
    sort_asc, sort_desc, sort_len_asc, sort_len_desc,
    regex_filter_lines, regex_extract_lines, text_replace,
} from './utils';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const TextProcPage: React.FC = () => {
    const { value, setValue, action, functionButtonGroup } = useBasic('');

    const [regexValue, setRegexValue] = useState('');
    const [replaceSourceValue, setReplaceSourceValue] = useState('');
    const [replaceDestinationValue, setReplaceDestinationValue] = useState('');

    const [statisticsShow, setStatisticsShow] = useState(false);
    const handleStatisticsDialogClose = () => setStatisticsShow(false);

    const valueLines = useMemo(() => value.split('\n').map(x => x.trim()).filter(x => x.length > 0), [value]);
    const valueLinesLength = useMemo(() => valueLines.map(x => x.length), [valueLines]);

    const memory_load = () => {
        if (confirm('是否使用存储区的内容替换当前内容?')) {
            setValue(localStorage.getItem("textproc_memory") ?? '');
        }
    }
    const memory_save = () => {
        localStorage.setItem("textproc_memory", value);
        toast.info('已保存到存储区', { autoClose: 3000 });
    }

    return (
        <>
            <Form.Control as="textarea" rows={15} spellCheck={false} value={value} onChange={e => setValue(e.target.value)} className='scrollable-textarea' />

            <InputGroup className="mt-2">
                <InputGroup.Text>正则表达式</InputGroup.Text>
                <Form.Control onChange={e => setRegexValue(e.target.value)} spellCheck={false} />
                <Button variant="outline-primary" onClick={action(regex_filter_lines(regexValue, false))} title="保留符合正则的行">包含</Button>
                <Button variant="outline-primary" onClick={action(regex_filter_lines(regexValue, true))} title="删除符合正则的行">排除</Button>
                <Button variant="outline-primary" onClick={action(regex_extract_lines(regexValue))} title="提取正则匹配到的组为 Excel 文本">提取</Button>

            </InputGroup>
            <InputGroup className="mt-2">
                <Form.Control onChange={e => setReplaceSourceValue(e.target.value)} spellCheck={false} />
                <InputGroup.Text>替换为</InputGroup.Text>
                <Form.Control onChange={e => setReplaceDestinationValue(e.target.value)} spellCheck={false} />
                <Button variant="outline-primary" onClick={action(text_replace(replaceSourceValue, replaceDestinationValue))}>替换</Button>
            </InputGroup>

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={action(split_by_comma)}>逗号切行</Button>
                    <Button variant="outline-primary" onClick={action(join_with_comma)}>逗号合行</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={action(remove_quote)}>去引号</Button>
                    <Button variant="outline-primary" onClick={action(add_quote)}>加引号</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={action(add_comma_suffix)}>行尾加逗号</Button>
                    <Button variant="outline-primary" onClick={action(remove_comma_suffix)}>行尾去逗号</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={action(split_by_blank)}>空白切行</Button>
                    <Button variant="outline-primary" onClick={action(trim_line_space)}>去除两边空白</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={action(remove_empty_line)}>去除空行</Button>
                    <Button variant="outline-primary" onClick={action(uniq_line)}>去除重复行</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={action(sort_asc)}>字典升序排序</Button>
                    <Button variant="outline-primary" onClick={action(sort_desc)}>字典降序排序</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={action(sort_len_asc)}>长度升序排序</Button>
                    <Button variant="outline-primary" onClick={action(sort_len_desc)}>长度降序排序</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={memory_save}>记忆存</Button>
                    <Button variant="outline-primary" onClick={memory_load}>记忆取</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="outline-primary" onClick={() => setStatisticsShow(true)}>统计</Button>
                </ButtonGroup>
                {functionButtonGroup}
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

export default TextProcPage
