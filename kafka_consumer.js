const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'block-explorer',
    brokers: ['localhost:9092'],
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const main = async () => {
    await consumer.connect()

    await consumer.subscribe({
        topic: 'Pricing',
        fromBeginning: true,
    })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            // TODO:  timescale insert
            console.log('Received message', {
                topic,
                partition,
                key: message.key.toString(),
                value: message.value.toString(),
            })
        },
    })
}

main().catch(async (error) => {
    console.error(error)
    try {
        await consumer.disconnect()
    } catch (e) {
        console.error('Failed to gracefully disconnect consumer', e)
    }
    process.exit(1)
})
