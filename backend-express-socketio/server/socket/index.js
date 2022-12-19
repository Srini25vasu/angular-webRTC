module.exports = (io) => {
    io.on('connection', socket => {
        console.log('new connection');
        io.on('disconnect', () => console.log('disconnected'));
    });
}