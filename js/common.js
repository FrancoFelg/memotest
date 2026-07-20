function calculateTimeDifference (startDatetime, finalDatetime) {
    var startDate = new Date(startDatetime);
    var finalDate = new Date(finalDatetime);
    
    var diffInMs = 0;
    var totalSeconds = 0;
    var minutes = 0;
    var seconds = 0;
    var formattedMinutes = '';
    var formattedSeconds = '';
    var startDelayTime = 5 * 1000; // Cantidad de segundos que muestra las cartas. No se contemplan porque no es tiempo jugado

    diffInMs = finalDate.getTime() - startDate.getTime() - startDelayTime;
    totalSeconds = Math.floor(diffInMs / 1000);
    minutes = Math.floor(totalSeconds / 60);
    seconds = totalSeconds % 60;

    formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
    formattedSeconds = seconds < 10 ? '0' + seconds : seconds.toString();
    
    return {
        minutes: minutes,
        seconds: seconds,
        totalSeconds: totalSeconds,
        formattedTime: formattedMinutes + ':' + formattedSeconds
    };
}