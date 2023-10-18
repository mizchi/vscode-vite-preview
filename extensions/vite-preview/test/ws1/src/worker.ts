addEventListener('message', (event) => {
  console.log('worker received message', event.data);
});