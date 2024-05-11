import LotteryGen from './components/lotterygen.tsx';
import TimeConv from './components/timeconv.tsx';
import UUIDCard from './components/uuidgen.tsx';

const FrontPage: React.FC = () => {
  return (
    <>
      <TimeConv />
      <UUIDCard />
      <LotteryGen />
    </>
  )
}

export default FrontPage
