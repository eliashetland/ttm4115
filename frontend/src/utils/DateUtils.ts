export class DateUtils {
  static timeStringFromMinutes(minutes: number | undefined | null): string {
    if (minutes == null) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const days = Math.floor(hours / 24);
    if (hours < 1) return `${mins}m`;
    if (hours < 24) return `${hours}h ${mins}m`;
    return `${days}d ${hours % 24}h ${mins}m`;
  }

  /**
	 * yy   = 2-digit year
	 * 
	 * yyyy = 4-digit year
	 * 
	 * M    = 1-12 month
	 * 
	 * MM   = 01-12 month
	 * 
	 * MMM  = short month
	 * 
	 * MMMM = long month
	 * 
	 * d    = 1-31 day
	 * 
	 * dd   = 01-31 day
	 * 
	 * E    = short day
	 * 
	 * EEEE = long day
	 * 
	 * HH   = 00-23 hour
	 * 
	 * mm   = 00-59 minute
	 * 
	 * ss   = 00-59 second
	 * 
	 * fff  = 000-999 millisecond
	 * 
	 *@example
		DateHandler.format(new Date(), "yyyy-MM-dd HH:mm:ss");
			 2001-01-01 00:00:00
	    
		DateHandler.format(new Date(), "E MMM dd, yyyy");
			Mon Jan 01, 2001
    
	 * @returns 
	 */
  static format(date: Date | string | number, format: string): string {
    const optionsLongMonth = { month: "long" } as const;
    const optionsShortMonth = { month: "short" } as const;
    const optionsLongDay = { weekday: "long" } as const;
    const optionsShortDay = { weekday: "short" } as const;

    let dateObj;

    switch (typeof date) {
      case "string":
        dateObj = new Date(date);
        break;
      case "number":
        dateObj = new Date(date);
        break;
      case "object":
        dateObj = new Date(date);
        break;
      default:
        console.log("Date is not a string, number or an object");
        return "INVALID DATE DATA";
    }

    const map: { [key: string]: string } = {
      yyyy: dateObj.getFullYear().toString(),
      yy: dateObj.getFullYear().toString().slice(-2),
      M: (dateObj.getMonth() + 1).toString(),
      MM: ("0" + (dateObj.getMonth() + 1)).slice(-2),
      d: dateObj.getDate().toString(),
      dd: ("0" + dateObj.getDate()).slice(-2),
      HH: ("0" + dateObj.getHours()).slice(-2),
      mm: ("0" + dateObj.getMinutes()).slice(-2),
      ss: ("0" + dateObj.getSeconds()).slice(-2),
      fff: ("00" + dateObj.getMilliseconds()).slice(-3),
      MMM: new Intl.DateTimeFormat(undefined, optionsShortMonth).format(
        dateObj,
      ),
      MMMM: new Intl.DateTimeFormat(undefined, optionsLongMonth).format(
        dateObj,
      ),
      E: new Intl.DateTimeFormat(undefined, optionsShortDay).format(dateObj),
      EEEE: new Intl.DateTimeFormat(undefined, optionsLongDay).format(dateObj),
    };

    return format.replace(
      /yyyy|yy|M{1,4}|d{1,2}|HH|mm|ss|fff|E{1,4}/gi,
      (matched) => map[matched],
    );
  }
}
