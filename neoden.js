var fileString;
var fileLines;
var convertedFile;
var valueList = {Designator:-1, Footprint:-1, Mid_X:-1, Mid_Y:-1, Layer:-1, Rotation:-1, Comment:-1};

function handleFileSelect(evt) {
	header.innerHTML = 'Units used: mm<br />Fields used: Designator, Footprint, Mid X, Mid Y, Layer, Rotation, Comment/Value<br />';
	fileString = '';
	convertedFile = '';
	valueList = {Designator:-1, Footprint:-1, Mid_X:-1, Mid_Y:-1, Layer:-1, Rotation:-1, Comment:-1};
	var file = evt.target.files[0]; // FileList object
	document.getElementById('convertButton').disabled = true;
	if (file && ( file.type.match('text/csv') || file.type.match('application/vnd.ms-excel') ) ) {
		var reader = new FileReader();
		// Closure to capture the file information.
		reader.readAsText(file, "UTF-8");
		reader.onload = (function(e) {
			fileString = reader.result;
			fileLines = fileString.split('\n');
			if (fileLines[10].search('Units used: mm') != 0) {
				alert('Wrong file or unit system');
				return -1;
			}
			header.innerHTML = '';
			for (var i = 0; i < 13; i++) header.innerHTML += fileLines[i] + '<br />';
			fileLines[12] = fileLines[12].split('"');
			for (var i = 0; i < fileLines[12].length; i++) {
				if (fileLines[12][i].search('Designator') == 0) valueList.Designator = i;
				if (fileLines[12][i].search('Footprint') == 0) valueList.Footprint = i;
				if (document.getElementById("rotateCheck").checked) {
					if (fileLines[12][i].search('Center-X') == 0) valueList.Mid_Y = i;
					if (fileLines[12][i].search('Center-Y') == 0) valueList.Mid_X = i;
				} else {
					if (fileLines[12][i].search('Center-X') == 0) valueList.Mid_X = i;
					if (fileLines[12][i].search('Center-Y') == 0) valueList.Mid_Y = i;
				}
				if (fileLines[12][i].search('Layer') == 0) valueList.Layer = i;
				if (fileLines[12][i].search('Rotation') == 0) valueList.Rotation = i;
				if (fileLines[12][i].search('Comment') == 0) valueList.Comment = i;
				if (fileLines[12][i].search('Value') == 0) valueList.Comment = i;
			}
			for (var item in valueList) if (valueList[item] < 0) {
				alert("Missing field: "+item);
				return -1;
			}
			document.getElementById('convertButton').disabled = false;
		});
	}
	else alert('Unsupported file extension, CSV only');
}

function convert() {
	convertedFile = 'Designator,Footprint,Mid X,Mid Y,Layer,Rotation,Comment\r\n';
	
	for (var i = 13; i < fileLines.length; i++) {
		if (fileLines[i]) {
			fileLines[i] = fileLines[i].split('"');

			if (fileLines[i][valueList.Designator]) {
				fileLines[i][valueList.Designator] = fileLines[i][valueList.Designator].replace(/[,]/g,''); // Designator
			}
			if (fileLines[i][valueList.Footprint]) {
				fileLines[i][valueList.Footprint] = fileLines[i][valueList.Footprint].replace(/[,]/g,''); // Footprint
			}
			if (fileLines[i][valueList.Comment]) {
				fileLines[i][valueList.Comment] = fileLines[i][valueList.Comment].replace(/[,]/g,''); // Comment
			}

			// Designator,Footprint,Mid X,Mid Y,Layer,Rotation,Comment/Value

			convertedFile += fileLines[i][valueList.Designator] + ','; // Designator
			convertedFile += fileLines[i][valueList.Footprint] + ','; // Footprint
			convertedFile += parseFloat(fileLines[i][valueList.Mid_X]).toFixed(2) + ','; // Mid X
			convertedFile += parseFloat(fileLines[i][valueList.Mid_Y]).toFixed(2) + ','; // Mid Y
			if (fileLines[i][valueList.Designator] == "TopLayer") {
				convertedFile += 'T' + ','; // Top Layer
			} else {
				convertedFile += 'B' + ','; // Bottom Layer
			}
			convertedFile += fileLines[i][valueList.Rotation] + ','; // Rotation
			convertedFile += fileLines[i][valueList.Comment] + '\r\n'; // Comment
		}
	}
	download(convertedFile, "Neoden_converted.csv");
}

// Function to download data to a file
function download(data, filename) {
    var a = document.createElement("a"),
        file = new Blob([data], {type: "text/csv"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
