import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const envPath = path.resolve(__dirname, "../../.env");
const envLocalPath = path.resolve(__dirname, "../../.env.local");

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

export default prisma;
