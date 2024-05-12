import LotteryGen from './components/lotterygen.tsx';
import TimeConv from './components/timeconv.tsx';
import UUIDCard from './components/uuidgen.tsx';
import QrcodeGen from './components/qrcode.tsx';

const FrontPage: React.FC = () => {
  return (
    <>
      <TimeConv />
      <UUIDCard />
      <LotteryGen />
      <QrcodeGen />
    </>
  )
}

export default FrontPage
