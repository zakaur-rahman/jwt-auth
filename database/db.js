import mongoose from "mongoose";

const Connect = async (username, password) => {
    const URL = `mongodb+srv://${username}:${password}@blog-app.d43xgoa.mongodb.net/authBackend?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(URL)
        console.log("Mongodb database connected.")

    } catch (err) {
        console.error(`Failed to connect database. ${err}`);
    };
};
export default Connect;