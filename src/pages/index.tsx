import LotteryGen from '../compoments/lotterygen.tsx';
import TimeConv from '../compoments/timeconv.tsx';
import UUIDCard from '../compoments/uuidgen.tsx';

const Render: React.FC = () => {
  return (
    <>
      <TimeConv />
      <UUIDCard />
      <LotteryGen />
    </>
  )
}

export default Render
