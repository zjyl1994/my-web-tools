import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { useDebounce } from "@uidotdev/usehooks";
import { useMemo, useState } from 'react';

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
    const parsedObj = useMemo(() => lossless_parse(props.src), [props.src]);

    const [jsonViewerFilter, setJsonViewerFilter] = useState('');
    const debouncedFilterKeyword = useDebounce(jsonViewerFilter, 300);

    return (
        <Modal show={props.show} fullscreen={true} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title style={{ fontWeight: 'bold', fontStyle: 'italic' }}>JsonViewer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control
                    type="text"
                    placeholder="搜索 JSON Key 或 Value"
                    onChange={e => setJsonViewerFilter(e.target.value)}
                    className='my-2'
                />
                <JsonView data={filterObjectByKeywordIgnoreCase(parsedObj, debouncedFilterKeyword)}
                    shouldExpandNode={allExpanded} style={defaultStyles} />
            </Modal.Body>
        </Modal>
    )
}

export default JsonViewer;
