export default function timeStampToDate(timestamp) {
    const date = new Date(timestamp)
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      const formattedDateTime = date.toLocaleString('en-US', options);
      return formattedDateTime
}