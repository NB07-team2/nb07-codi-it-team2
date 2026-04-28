import { PORT } from './utils/constants.util';
import app from './app';

app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
