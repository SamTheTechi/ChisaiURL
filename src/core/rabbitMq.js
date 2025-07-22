// Thought of implementing write_behind cache but did't due to shit load of data consistency issue (multiple short for one original)
//
// import amqplib from "amqplib";
//
// let connection = null;
// let channel = null;
//
// export const rabbitMq = async () => {
//   if (connection && channel) return { connection, channel };
//
//   connection = await amqplib.connect(process.env.RABBITMQ_URL);
//   channel = await connection.createChannel();
//
//   return { connection, channel };
// };
