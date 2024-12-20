"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("./routes/user");
const jobRoute_1 = require("./routes/jobRoute");
const aiAnalysis_1 = require("./routes/aiAnalysis");
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/ai", aiAnalysis_1.aiRouter);
app.use('/job', jobRoute_1.jobRouter);
app.use("/user", user_1.userRouter);
app.get("/", (req, res) => {
    res.json({
        message: "The app seems to be working"
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        app.listen(3000, () => {
            console.log("Listening on port 3000");
        });
    });
}
main();
