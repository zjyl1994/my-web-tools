import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { useBasic } from '@/hooks/use-basic';
import {
    split_by_comma, join_with_comma,
    trim_line_space, remove_empty_line, split_by_blank,
    add_quote, remove_quote, uniq_line,
    add_comma_suffix, remove_comma_suffix,
    nums_average, nums_max, nums_min,
    sort_asc, sort_desc, sort_len_asc, sort_len_desc,
    regex_filter_lines, regex_extract_lines,
} from './utils';
import { useMemo, useState } from 'react';


const TextProcPage: React.FC = () => {
    const { value, setValue, action, copy, paste } = useBasic('');
    const [regexValue, setRegexValue] = useState('');

    const valueLines = useMemo(() => value.split('\n').map(x => x.trim()).filter(x => x.length > 0), [value]);
    const valueLinesLength = useMemo(() => valueLines.map(x => x.length), [valueLines]);

    return (
        <>
            <Form.Control as="textarea" rows={20} spellCheck={false} value={value} onChange={e => setValue(e.target.value)} />

            <InputGroup className="mt-2">
                <InputGroup.Text>正则表达式</InputGroup.Text>
                <Form.Control onChange={e => setRegexValue(e.target.value)} />
                <Button variant="outline-primary" onClick={action(regex_filter_lines(regexValue, false))} title="保留符合正则的行">包含</Button>
                <Button variant="outline-primary" onClick={action(regex_filter_lines(regexValue, true))} title="删除符合正则的行">排除</Button>
                <Button variant="outline-primary" onClick={action(regex_extract_lines(regexValue))} title="提取正则匹配到的组为 Excel 文本">提取</Button>

            </InputGroup>

            <div className="mt-2">
                <span className="me-2">总长度 {value.length}</span>
                <span className="me-2">总行数 {valueLines.length}</span>
                <span className="me-2">最长行长度 {nums_max(valueLinesLength)}</span>
                <span className="me-2">最短行长度 {nums_min(valueLinesLength)}</span>
                <span className="me-2">平均行长度 {nums_average(valueLinesLength).toFixed(2)}</span>
            </div>

            <ButtonToolbar className="mt-2">
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(split_by_comma)}>逗号切行</Button>
                    <Button variant="outline-primary" onClick={action(join_with_comma)}>逗号合行</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(remove_quote)}>去引号</Button>
                    <Button variant="outline-primary" onClick={action(add_quote)}>加引号</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(add_comma_suffix)}>行尾加逗号</Button>
                    <Button variant="outline-primary" onClick={action(remove_comma_suffix)}>行尾去逗号</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(split_by_blank)}>空白切行</Button>
                    <Button variant="outline-primary" onClick={action(trim_line_space)}>去除两边空白</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(remove_empty_line)}>去除空行</Button>
                    <Button variant="outline-primary" onClick={action(uniq_line)}>去除重复行</Button>
                </ButtonGroup>
            </ButtonToolbar>
            <ButtonToolbar className="mt-2">
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(sort_asc)}>字典升序排序</Button>
                    <Button variant="outline-primary" onClick={action(sort_desc)}>字典降序排序</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={action(sort_len_asc)}>长度升序排序</Button>
                    <Button variant="outline-primary" onClick={action(sort_len_desc)}>长度降序排序</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                    <Button variant="outline-primary" onClick={copy}>复制</Button>
                    <Button variant="outline-primary" onClick={paste}>粘贴</Button>
                    <Button variant="outline-primary" onClick={() => setValue('')}>清空</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default TextProcPage
