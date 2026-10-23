export default function ActionError({ message }: { message: string }) {
  if (!message) return null;
  return <div className="ui-field-error" role="alert" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message}</div>;
}
