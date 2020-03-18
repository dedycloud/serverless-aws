'use strict';
import { respond } from "./IO/response";
import { Handler } from "aws-lambda/handler";

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const tableName = process.env.MUSIC_TABLE;

//post
export const create: Handler = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const post = {
    id: uuid.v1(),
    createdAt: new Date().toString(),
    title: requestBody.title,
    body: requestBody.body
  };
  return dynamoDB.put({
    TableName: tableName,
    Item: post
  }).promise().then(() => {
    callback(null, respond(post, 200));
  }).catch((err) => callback(null, respond(err, err.statusCode)))
}
//get All music
export const get: Handler = (event, context, callback) => {
  return dynamoDB
    .scan({
      TableName: tableName
    })
    .promise()
    .then((res) => {
      callback(null, respond(res.Items, 200));
    })
    .catch((err) => callback(null, respond(err, err.statusCode)));
};

//get by id
export const getById: Handler = (event, context, callback) => {
  const id = event.pathParameters.id;
  const params = {
    Key: { id: id },
    TableName: tableName
  };
  return dynamoDB
    .get(params)
    .promise()
    .then((res) => {
      if (res.Item) callback(null, respond(res.Item, 200));
      else callback(null, respond({ error: 'Post not found' }, 404));
    })
    .catch((err) => callback(null, respond(err, err.statusCode)));
};

//delete
export const deletes: Handler = (event, context, callback) => {
  const id = event.pathParameters.id;
  const params = {
    Key: {
      id: id
    },
    TableName: tableName
  };
  return dynamoDB
    .delete(params)
    .promise()
    .then(() =>
      callback(null, respond({ message: 'Post deleted successfully' }, 200))
    )
    .catch((err) => callback(null, respond(err, err.statusCode)));
};
// //update
export const update: Handler = (event, context, callback) => {
  const id = event.pathParameters.id;
  const requestBody = JSON.parse(event.body);
  const { body, title } = requestBody;

  const params = {
    Key: {
      id: id
    },
    TableName: tableName,
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'SET title = :title, body = :body',
    ExpressionAttributeValues: {
      ':title': title,
      ':body': body
    },
    ReturnValues: 'ALL_NEW'
  };
  console.log('Updating');
  return dynamoDB
    .update(params)
    .promise()
    .then((res) => {
      console.log(res);
      callback(null, respond(res.Attributes, 200));
    })
    .catch((err) => callback(null, respond(err, err.statusCode)));

}

export const notFound: Handler = (event, context, callback) => {
  const response = {
    statusCode: 404,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({ "message": "Not Found" })
  };

  callback(null, response);
};

