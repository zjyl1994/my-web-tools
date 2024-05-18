import TimeConv from './components/timeconv.tsx';
import UUIDCard from './components/uuidgen.tsx';
import Roll from './components/roll.tsx';

const FrontPage: React.FC = () => {
  return (
    <>
      <Roll />
      <TimeConv />
      <UUIDCard />
    </>
  )
}

export default FrontPage
