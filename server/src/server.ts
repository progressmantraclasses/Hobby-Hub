import { env } from "./config/env";
import app from "./app";

app.listen(Number(env.PORT), () => {
    console.log(`Server running on port ${env.PORT}`);
});
