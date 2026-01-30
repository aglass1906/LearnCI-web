import { getChannelDetails } from "./utils/youtube";
import { config } from "dotenv";
config({ path: ".env.local" });

async function run() {
    const channelId = "UC5GNAC8a68xLid0o4_mftBA";
    console.log("Fetching details for:", channelId);
    try {
        const details = await getChannelDetails(channelId);
        console.log("Details:", JSON.stringify(details, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
