var unFormatedDates = $('.meta span span.displayDate');

console.log(unFormatedDates);

for (var i = 0; i < unFormatedDates.length; i++) {
    console.log($(unFormatedDates[i]).text());
    var newDate = new XDate($(unFormatedDates[i]).text());

    console.log(newDate.toLocaleDateString());

    $(unFormatedDates[i]).text(newDate.toLocaleDateString());
    
};