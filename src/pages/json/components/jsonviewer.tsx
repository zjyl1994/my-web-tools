import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { useDebounce } from "@uidotdev/usehooks";
import { useMemo, useState, startTransition } from 'react';

import {
    filterObjectByKeywordIgnoreCase,
    lossless_parse
} from '../utils';

type JsonViewerProps = {
    show: boolean;
    src: string;
    onHide: () => void;
};


const JsonViewer: React.FC<JsonViewerProps> = (props) => {
    const [jsonViewerFilter, setJsonViewerFilter] = useState('');
    const [filterKeyword, setFilterKeyword] = useState('');
    const debouncedFilterKeyword = useDebounce(filterKeyword, 200);
    const parsedObj = useMemo(() => lossless_parse(props.src), [props.src])

    return (
        <Modal show={props.show} fullscreen={true} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title style={{ fontWeight: 'bold', fontStyle: 'italic' }}>JsonViewer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control
                    type="text"
                    placeholder="搜索 JSON Key 或 Value"
                    value={jsonViewerFilter}
                    onChange={e => {
                        setJsonViewerFilter(e.target.value);
                        startTransition(() => setFilterKeyword(e.target.value))
                    }}
                    className='my-2'
                />
                {useMemo(() => {
                    const filteredObj = filterObjectByKeywordIgnoreCase(parsedObj, debouncedFilterKeyword);
                    return <JsonView
                        data={filteredObj}
                        shouldExpandNode={allExpanded} style={defaultStyles}
                    />
                }, [parsedObj, debouncedFilterKeyword])}

            </Modal.Body>
        </Modal>
    )
}

export default JsonViewer;
