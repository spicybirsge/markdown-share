
export default function timeStampToDate(timestamp: number) {
    const date = new Date(timestamp)
    const options: Intl.DateTimeFormatOptions = {
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