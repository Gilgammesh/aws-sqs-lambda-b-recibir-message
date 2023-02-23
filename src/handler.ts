import { Context, SQSEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

// Instanciamos el servicio de simple queue
const sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.QUEUE_URL as string;

export const receiveQueue = async (event: SQSEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const params: AWS.SQS.ReceiveMessageRequest = {
    QueueUrl: QUEUE_URL,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 10,
    MessageAttributeNames: ['All']
  };

  try {
    const data = await sqs.receiveMessage(params).promise();

    if (data.Messages !== undefined && data.Messages[0].Body) {
      //Mensaje del body
      const mensajeBody = JSON.parse(data.Messages[0].Body);
      console.log(' mensajes de la data', mensajeBody);

      const deleteParams: AWS.SQS.DeleteMessageRequest = {
        QueueUrl: QUEUE_URL,
        ReceiptHandle: data.Messages[0].ReceiptHandle as string
      };
      try {
        await sqs.deleteMessage(deleteParams).promise();
        console.log('Se a eliminado el mensaje de la cola');
      } catch (err) {
        console.log('Erorr al eliminar el mensaje d ela cola ', err);
      }

      return {
        statusCode: 200,
        body: JSON.stringify(mensajeBody)
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'no hay cuerpo en el mensaje' })
      };
    }
  } catch (error) {
    console.log('error catch----------- ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error })
    };
  }
};
