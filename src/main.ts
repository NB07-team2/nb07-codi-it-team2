import { PORT } from "./utils/constants";
import { createServer } from "http";
import app from "./app";

const server = createServer(app);
//웹소켓 구현된거 나중에 추가.

server.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
