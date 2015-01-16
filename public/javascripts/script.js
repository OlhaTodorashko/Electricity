/**
 * Created by olegra on 14.01.2015.
 */
var validateDate = (function () {
    var startRangeDate = new Date(2006, 11, 16),
        endRangeDate = new Date(2010, 11, 26);

    return {
        mdy: function (date) {
            var date = date.split('/');
            return new Date(date[2], date[0] - 1, date[1]);
        },
        validateRange: function (startDate, endDate) {
            var startDate = this.mdy(startDate),
                endDate = this.mdy(endDate);

            if (startDate > endDate) {
                return false;
            }

            return (startDate >= startRangeDate && endDate <= endRangeDate);
        }
    };
}());

$(document).ready(function () {

    var start = $("#date-picker-1").datepicker(),
        end = $("#date-picker-2").datepicker(),
        container = $('#chart'),
        errorDateBlock = $("#invalidDate"),
        load = $('#load'),
        calculBtn = $("#calcul"),
        currentResults = null;

    calculBtn.on("click", function () {

        var startDate = start.val(),
            endDate = end.val();

        if (!validateDate.validateRange(startDate, endDate)) {
            container.empty();
            errorDateBlock.toggle('slow').fadeOut(4000, function () {
                start.val("");
                end.val("");
            });
            return;
        }

        var form_data = {
                date: {
                    type: 'Date',
                    start: startDate,
                    end: endDate
                }
            };

        container.empty();
        calculBtn.prop('disabled', true);
        load.show();

        $.ajax({
            type: "GET",
            url: "/loadData",
            data: form_data,
            dataType: 'json',
            error: function () {
                alert('Update failed. Try again');
            },
            success: function (data) {
                load.hide();
                calculBtn.prop('disabled', true);
                currentResults = data;
                /*console.log(data.length);*/

                var dataset = new vis.DataSet(data),
                    graphOptions = {
                        sampling: true,
                        drawPoints: false,
                        catmullRom: false,
                        start: startDate,
                        end: endDate,
                        dataAxis: {
                            customRange: {
                                left:{
                                    min: 220, max: 260
                                }
                            },
                            title:{
                                left:{
                                    text: "Voltage"
                                }
                            }
                        }
                    },
                    graph2d = new vis.Graph2d(container[0], dataset, graphOptions);
            }
        });
    });
});