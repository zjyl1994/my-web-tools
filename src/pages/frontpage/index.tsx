import TimeConv from './components/timeconv.tsx';
import UUIDCard from './components/uuidgen.tsx';
import Roll from './components/roll.tsx';
import T9Gen from './components/t9gen.tsx';

const FrontPage: React.FC = () => {
  return (
    <>
      <Roll />
      <TimeConv />
      <UUIDCard />
      <T9Gen />
    </>
  )
}

export default FrontPage
