import LotteryGen from './lotterygen.tsx';
import TimeConv from './timeconv.tsx';
import UUIDCard from './uuidgen.tsx';

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
