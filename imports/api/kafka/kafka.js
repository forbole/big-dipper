const { Kafka } = Meteor.npmRequire('kafkajs')

const bootStrap = process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092'

export const kafka = new Kafka({
    clientId: 'block-explorer',
    brokers: [bootStrap],
})
