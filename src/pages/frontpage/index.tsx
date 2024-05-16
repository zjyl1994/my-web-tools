import LotteryGen from './components/lotterygen.tsx';
import TimeConv from './components/timeconv.tsx';
import UUIDCard from './components/uuidgen.tsx';
import Roll from './components/roll.tsx';

const FrontPage: React.FC = () => {
  return (
    <>
      <Roll />
      <TimeConv />
      <LotteryGen />
      <UUIDCard />
    </>
  )
}

export default FrontPage
