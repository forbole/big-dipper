export const goTimeToISOString = (time) => {
    const millisecond = parseInt(time.seconds+time.nanos.toString().substring(0,3));
    return (new Date(millisecond)).toISOString()
}