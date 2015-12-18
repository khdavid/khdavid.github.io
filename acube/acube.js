$(document).ready(function() {

	ScreenWidthMin = 1280;
	ScreenHeightMin = 720
	ScreenWidth = $(window).width() - 10;
	ScreenHeight = $(window).height() - 10;

	if (ScreenHeight < ScreenHeightMin) {
		ScreenHeight = ScreenHeightMin;
	}
	if (ScreenWidth < ScreenWidthMin) {
		ScreenWidth = ScreenWidthMin;
	}

	error = false;
	sliderWidth = 15;
	pieceWidth = 80;
	centerX = ScreenWidth / 2;
	centerY = 3 * pieceWidth;
	pieceX = 200;
	pieceY = sliderWidth;
	sliderAngleX = pieceX;
	sliderAngleY = 10;
	sliderColor = '#00D2FF';
	sliderParamLength = 1000;
	pieceLength = 1000;
	deltaT = 0.02;
	scale = 30;
	polygoneWidth = pieceWidth / scale;
	perspectiveDistance = 500;

	lengthUp = new Array();
	lengthDown = new Array();
	distanceUp = new Array();
	distanceDown = new Array();
	polygoneUp = new Array();
	polygoneDown = new Array();
	polygoneRawUp = new Array();
	polygoneRawDown = new Array();
	angleUp = new Array();
	angleFoldDesire = new Array();
	angleFold = new Array();
	circleArray = new Array();
	polygonePictureRotated = new Array();
	polygonePicture = new Array();
	EulerMatrixForRotation = [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ];

	var stageControl = new Kinetic.Stage({
		container : 'containerControl',
		width : pieceLength + pieceX + sliderWidth + 600,
		height : 2 * pieceWidth + pieceY + 2 * sliderWidth
	});
	var layerControl = new Kinetic.Layer();

	angleFoldDesire[1] = (Math.PI / 3);
	lengthUp.push(3);
	lengthUp.push(7);
	lengthDown.push(7);
	lengthDown.push(4);

	for (var i = 0; i < 5; i++) {
		polygoneRawUp.push([ 0, 0, 0 ]);
		polygoneRawDown.push([ 0, -polygoneWidth, 0 ]);
	}

	rawPolygoneToPolygone();
	adjustAngles();
	ControlBar();

	stagePolygone = new Kinetic.Stage({
		container : 'container',
		width : ScreenWidth,
		height : pieceWidth * 8
	});
	layerPolygone = new Kinetic.Layer();
	for (var i = 0; i < polygoneDown.length - 1; i++) {

		polygonePicture[i] = new Kinetic.Polygon({
			points : [ 0, 0 ],
			stroke : 'black',
			strokeWidth : 5,
			lineJoin : 'round',
		});

		polygonePictureRotated[i] = polygonePicture[i].clone();
		layerControl.add(polygonePicture[i]);
		layerPolygone.add(polygonePictureRotated[i]);
		stagePolygone.add(layerPolygone);

	}

	draw();

	paramString = [ ((Math.PI - angleFoldDesire[1]) / 2 / Math.PI * 360), polygoneRawUp[1][0], polygoneRawUp[2][0], polygoneRawUp[3][0], polygoneRawDown[1][0], polygoneRawDown[2][0], polygoneRawDown[3][0] ]
	for (var i = 0; i < paramString.length; i++) {
		paramString[i] = paramString[i].toFixed(3);
	}
	document.getElementById("inputAngle").value = paramString;
	stageControl.add(layerControl);
	// SetAttributes(polygonePicture);

	dt = 0;

	InfinitesimalMatrix = [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ];
	anim = new Kinetic.Animation(function(frame) {
		// $('p').text(polygoneDown[1])
		SetAttributesRotated(polygonePictureRotated, InfinitesimalMatrix);
		InfinitesimalMatrix = [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ];
		dt += 1;
		if (dt > 0) {
			anim.stop();
		}

	}, layerPolygone);

	anim.start();
	keyDownOn();
	function keyDownOn() {
		$(document).on('keydown', function(e) {

			if (e.keyCode == 37) {
				InfinitesimalMatrix = [ [ 1, 0, -deltaT ], [ 0, 1, 0 ], [ deltaT, 0, 1 ] ];
				anim.start();
				return false;
			}
			if (e.keyCode == 38) {

				InfinitesimalMatrix = [ [ 1, 0, 0 ], [ 0, 1, deltaT ], [ 0, -deltaT, 1 ] ];
				anim.start();
				return false;
			}
			if (e.keyCode == 39) {
				InfinitesimalMatrix = [ [ 1, 0, deltaT ], [ 0, 1, 0 ], [ -deltaT, 0, 1 ] ];
				anim.start();
				return false;
			}
			if (e.keyCode == 40) {
				InfinitesimalMatrix = [ [ 1, 0, 0 ], [ 0, 1, -deltaT ], [ 0, deltaT, 1 ] ];
				anim.start();
				return false;

			}
			return true;

		});
	}
	function draw() {
		dt = 0;
		// $('#coord1').text(polygoneRawUp)
		rawPolygoneToPolygone();

		adjustAngles();

		for (var i = 1; i < 4; i++) {
			polygoneRotation(i, angleFoldDesire[i]);
		}

		lastAdaptation();

		for (var i = 1; i < 4; i++) {
			polygoneRotation(4 - i, -angleFoldDesire[4 - i]);
		}

		SetAttributes(polygonePicture);
		if (polygoneUp[0][0] < polygoneDown[0][0]) {
			shiftToBegin = polygoneUp[0][0];
		} else {
			shiftToBegin = polygoneDown[0][0];
		}
		enlargment = scale / pieceWidth
		if (error) {
			$('#coord1').text('error')
			$('#coord2').text('error')

		} else {
			$('#coord1').text((enlargment * (polygoneUp[0][0] - shiftToBegin)).toFixed(3) + ' ' + (enlargment * (polygoneUp[1][0] - shiftToBegin)).toFixed(3) + ' ' + (enlargment * (polygoneUp[2][0] - shiftToBegin)).toFixed(3) + ' ' + (enlargment * (polygoneUp[3][0] - shiftToBegin)).toFixed(3) + ' ' + (enlargment * (polygoneUp[4][0] - shiftToBegin)).toFixed(3))
			$('#coord2').text((enlargment * (polygoneDown[0][0] - shiftToBegin)).toFixed(3) + ' ' + (enlargment * (polygoneDown[1][0] - shiftToBegin)).toFixed(3) + ' ' + (enlargment * (polygoneDown[2][0] - shiftToBegin)).toFixed(3) + ' ' + (enlargment * (polygoneDown[3][0] - shiftToBegin)).toFixed(3) + ' ' + (enlargment * (polygoneDown[4][0] - shiftToBegin)).toFixed(3))

		}
		$('#ang').text("angles: " 
		+ (180 - angleFoldDesire[1] / Math.PI * 180).toFixed(3)+", "
		+(180 - angleFoldDesire[2] / Math.PI * 180).toFixed(3)+", "
		+(180 - angleFoldDesire[3] / Math.PI * 180).toFixed(3)
		);
		for (var i = 1; i < 4; i++) {
			polygoneRotation(i, angleFoldDesire[i]);
		}
		
		aUp=[polygoneUp[1][0]-polygoneUp[0][0],polygoneUp[1][1]-polygoneUp[0][1],polygoneUp[1][2]-polygoneUp[0][2]];
		bUp=[polygoneUp[2][0]-polygoneUp[1][0],polygoneUp[2][1]-polygoneUp[1][1],polygoneUp[2][2]-polygoneUp[1][2]];
		cUp=[polygoneUp[3][0]-polygoneUp[2][0],polygoneUp[3][1]-polygoneUp[2][1],polygoneUp[3][2]-polygoneUp[2][2]];
		dUp=[polygoneUp[4][0]-polygoneUp[3][0],polygoneUp[4][1]-polygoneUp[3][1],polygoneUp[4][2]-polygoneUp[3][2]];
		
		$('#upSides').html( "a = "+(enlargment*vectorLength(aUp)).toFixed(3) 
		+ " b = "+(enlargment*vectorLength(bUp)).toFixed(3)  
		+ " c = "+(enlargment*vectorLength(cUp)).toFixed(3)  
		+ " d = "+(enlargment*vectorLength(dUp)).toFixed(3)  
		);

		$('#upAngles').html( 
		"&ang;"+ "ab = "+(180-angleBetweenVectors(aUp,bUp)).toFixed(3)
		+" &ang;"+ "bc = "+(180-angleBetweenVectors(bUp,cUp)).toFixed(3) 
		+" &ang;"+ "cd = "+(180-angleBetweenVectors(cUp,dUp)).toFixed(3) 
		+" &ang;"+ "da = "+(180-angleBetweenVectors(dUp,aUp)).toFixed(3) 
		);

		aDown=[polygoneDown[1][0]-polygoneDown[0][0],polygoneDown[1][1]-polygoneDown[0][1],polygoneDown[1][2]-polygoneDown[0][2]];
		bDown=[polygoneDown[2][0]-polygoneDown[1][0],polygoneDown[2][1]-polygoneDown[1][1],polygoneDown[2][2]-polygoneDown[1][2]];
		cDown=[polygoneDown[3][0]-polygoneDown[2][0],polygoneDown[3][1]-polygoneDown[2][1],polygoneDown[3][2]-polygoneDown[2][2]];
		dDown=[polygoneDown[4][0]-polygoneDown[3][0],polygoneDown[4][1]-polygoneDown[3][1],polygoneDown[4][2]-polygoneDown[3][2]];

		$('#downSides').html( "a = "+(enlargment*vectorLength(aDown)).toFixed(3) 
		+ " b = "+(enlargment*vectorLength(bDown)).toFixed(3)  
		+ " c = "+(enlargment*vectorLength(cDown)).toFixed(3)  
		+ " d = "+(enlargment*vectorLength(dDown)).toFixed(3)  
		);

		$('#downAngles').html( 
		"&ang;"+ "ab = "+(180-angleBetweenVectors(aDown,bDown)).toFixed(3)
		+" &ang;"+ "bc = "+(180-angleBetweenVectors(bDown,cDown)).toFixed(3) 
		+" &ang;"+ "cd = "+(180-angleBetweenVectors(cDown,dDown)).toFixed(3) 
		+" &ang;"+ "da = "+(180-angleBetweenVectors(dDown,aDown)).toFixed(3) 
		);
		
		
		// stageControl.setWidth((distanceUp[0]+distanceUp[1]+distanceUp[2]+distanceUp[3])*scale);

	}
	
	function angleBetweenVectors(a,b)
	{
	   return (180/Math.PI)*Math.acos(scalarProduct(a,b)/Math.sqrt(scalarProduct(a,a)*scalarProduct(b,b)));
	}
	function scalarProduct(a,b)
	{
	   return (a[0]*b[0]+a[1]*b[1]+a[2]*b[2]);
	}
    function vectorLength(a)
	{
	   return Math.sqrt(scalarProduct(a,a));
	}

	function rawPolygoneToPolygone() {

		for (var i = 0; i < polygoneRawDown.length; i++) {
			polygoneUp[i] = (polygoneRawUp[i].slice());
			polygoneDown[i] = (polygoneRawDown[i].slice());

		}
		polygoneUp[0][0] = -10;
		polygoneDown[0][0] = -10;
		polygoneUp[4][0] = polygoneUp[3][0] + 10;
		polygoneDown[4][0] = polygoneUp[3][0] + 10;

	}

	function adjustAngles() {

		for (var i = 0; i < polygoneDown.length; i++) {
			angleUp[i] = Math.PI / 2 + Math.atan((polygoneDown[i][0] - polygoneUp[i][0]) / polygoneWidth);
			if (i != 1) {
				angleFoldDesire[i] = 0;
			}
			angleFold[i] = 0;

		}
		angleFoldDesire[2] = -2 * Math.atan(Math.tan(angleFoldDesire[1] / 2) * Math.cos(angleUp[1]) / Math.cos(angleUp[2]));
		angleFoldDesire[3] = -2 * Math.atan(Math.tan(angleFoldDesire[2] / 2) * Math.cos(angleUp[2]) / Math.cos(angleUp[3]));

		for (var i = 1; i < polygoneDown.length; i++) {
			distanceUp[i - 1] = (Math.sqrt(Math.pow(polygoneUp[i][0] - polygoneUp[i - 1][0], 2) + Math.pow(polygoneUp[i][1] - polygoneUp[i - 1][1], 2) + Math.pow(polygoneUp[i][2] - polygoneUp[i - 1][2], 2)));
			distanceDown[i - 1] = (Math.sqrt(Math.pow(polygoneDown[i][0] - polygoneDown[i - 1][0], 2) + Math.pow(polygoneDown[i][1] - polygoneDown[i - 1][1], 2) + Math.pow(polygoneDown[i][2] - polygoneDown[i - 1][2], 2)));
		}

	}

	function polygoneRotation(edge, angle) {
		angleFold[edge] = angleFold[edge] + angle;
		for (var i = edge + 1; i < polygoneDown.length; i++) {

			a_x = polygoneUp[edge][0] - polygoneDown[edge][0];
			a_y = polygoneUp[edge][1] - polygoneDown[edge][1];
			a_z = polygoneUp[edge][2] - polygoneDown[edge][2];

			x_0 = polygoneUp[edge][0];
			y_0 = polygoneUp[edge][1];
			z_0 = polygoneUp[edge][2];

			x_Up = polygoneUp[i][0];
			y_Up = polygoneUp[i][1];
			z_Up = polygoneUp[i][2];

			t = ((x_Up - x_0) * a_x + (y_Up - y_0) * a_y + (z_Up - z_0) * a_z) / (a_x * a_x + a_y * a_y + a_z * a_z);

			x_rot = x_0 + t * a_x;
			y_rot = y_0 + t * a_y;
			z_rot = z_0 + t * a_z;

			a_xrad = x_Up - x_rot;
			a_yrad = y_Up - y_rot;
			a_zrad = z_Up - z_rot;
			a_radLength = Math.sqrt(a_xrad * a_xrad + a_yrad * a_yrad + a_zrad * a_zrad);

			a_xtangent = a_y * a_zrad - a_yrad * a_z;
			a_ytangent = a_z * a_xrad - a_zrad * a_x;
			a_ztangent = a_x * a_yrad - a_xrad * a_y;
			a_tangentLength = Math.sqrt(a_xtangent * a_xtangent + a_ytangent * a_ytangent + a_ztangent * a_ztangent);

			polygoneUp[i][0] = x_rot + a_radLength * (a_xrad * Math.cos(angle) / a_radLength + a_xtangent * Math.sin(angle) / a_tangentLength);
			polygoneUp[i][1] = y_rot + a_radLength * (a_yrad * Math.cos(angle) / a_radLength + a_ytangent * Math.sin(angle) / a_tangentLength);
			polygoneUp[i][2] = z_rot + a_radLength * (a_zrad * Math.cos(angle) / a_radLength + a_ztangent * Math.sin(angle) / a_tangentLength);

			if (distanceUp[i - 1] != 0) {
				polygoneDown[i][0] = polygoneDown[i - 1][0] + (polygoneUp[i][0] - polygoneUp[i - 1][0]) * distanceDown[i - 1] / distanceUp[i - 1];
				polygoneDown[i][1] = polygoneDown[i - 1][1] + (polygoneUp[i][1] - polygoneUp[i - 1][1]) * distanceDown[i - 1] / distanceUp[i - 1];
				polygoneDown[i][2] = polygoneDown[i - 1][2] + (polygoneUp[i][2] - polygoneUp[i - 1][2]) * distanceDown[i - 1] / distanceUp[i - 1];
			}
		}

	}
	function lastAdaptation() {
		error = false;
		coeffEnlargmentUp = polygoneUp[3][2] / (polygoneUp[3][2] - polygoneUp[4][2]);
		coeffEnlargmentDown = polygoneDown[3][2] / (polygoneDown[3][2] - polygoneDown[4][2]);

		if ((coeffEnlargmentUp > 0) && (coeffEnlargmentDown > 0)) {

			polygoneUp[4][0] = polygoneUp[3][0] + coeffEnlargmentUp * (polygoneUp[4][0] - polygoneUp[3][0]);
			polygoneUp[4][1] = 0;
			polygoneUp[4][2] = 0;

			polygoneDown[4][0] = polygoneDown[3][0] + coeffEnlargmentDown * (polygoneDown[4][0] - polygoneDown[3][0]);
			polygoneDown[4][1] = -polygoneWidth;
			polygoneDown[4][2] = 0;

		} else {
			error = true;
		}
		if ((polygoneDown[1][0] > polygoneDown[4][0]) && (polygoneUp[1][0] > polygoneUp[4][0])) {
			polygoneDown[0][0] = polygoneDown[4][0];
			polygoneUp[0][0] = polygoneUp[4][0];
		} else {
			error = true;
		}
		for (var i = 1; i < polygoneDown.length; i++) {
			distanceUp[i - 1] = (Math.sqrt(Math.pow(polygoneUp[i][0] - polygoneUp[i - 1][0], 2) + Math.pow(polygoneUp[i][1] - polygoneUp[i - 1][1], 2) + Math.pow(polygoneUp[i][2] - polygoneUp[i - 1][2], 2)));
			distanceDown[i - 1] = (Math.sqrt(Math.pow(polygoneDown[i][0] - polygoneDown[i - 1][0], 2) + Math.pow(polygoneDown[i][1] - polygoneDown[i - 1][1], 2) + Math.pow(polygoneDown[i][2] - polygoneDown[i - 1][2], 2)));
		}

		// $('p').text(coeffEnlargmentUp + ' ' + coeffEnlargmentDown);

	}

	function SetAttributes(polygonePicture) {
		for (var i = 0; i < polygoneDown.length - 1; i++) {
			polygonePicture[i].setAttrs({
				points : [ pieceX + scale * polygoneDown[i][0], pieceY - scale * polygoneDown[i][1], pieceX + scale * polygoneDown[i + 1][0], pieceY - scale * polygoneDown[i + 1][1], pieceX + scale * polygoneUp[i + 1][0], pieceY - scale * polygoneUp[i + 1][1], pieceX + scale * polygoneUp[i][0], pieceY - scale * polygoneUp[i][1] ]
			});
			polygonePicture[i].moveToBottom();
		}

		// stageControl.add(layerControl);
	}

	function ScalarProduct(a, b) {
		var result = 0;
		for (var i = 0; i < a.length; i++) {
			result = result + a[i] * b[i];

		}
		return result;
	}
	function VectorProduct(a, b) {
		var result = new Array();
		result[0] = a[1] * b[2] - a[2] * b[1];
		result[1] = -a[0] * b[2] + a[2] * b[0];
		result[2] = a[0] * b[1] - a[1] * b[0];
		return result;
	}
	function MatrixProduct(S1, S2) {
		var S = new Array();
		for (var i = 0; i < 3; i++) {
			S[i] = [ 0, 0, 0 ];
		}
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				for (var k = 0; k < 3; k++) {
					S[i][j] = S[i][j] + S1[i][k] * S2[k][j];
				}
			}
		}
		return S
	}
	function MatrixOrthogonalization(S) {
		l00 = ScalarProduct(S[0], S[0]);
		if (l00 != 0) {
			for (var j = 0; j < 3; j++) {
				S[0][j] = S[0][j] / Math.sqrt(l00);
			}
		}
		l01 = ScalarProduct(S[0], S[1]);

		for (var j = 0; j < 3; j++) {
			S[1][j] = S[1][j] - S[0][j] * l01;
		}
		l11 = ScalarProduct(S[1], S[1]);
		if (l11 != 0) {
			for (var j = 0; j < 3; j++) {
				S[1][j] = S[1][j] / Math.sqrt(l11);
			}
		}
		S01 = VectorProduct(S[0], S[1]);
		if (ScalarProduct(S01, S[2]) > 0) {
			S[2] = S01;
		} else {
			S[2] = VectorProduct(S[1], S[0]);
			;
		}
		return (S);
	}

	function EulerMatrix(a, b, c) {
		S = new Array();
		S[0] = [ Math.cos(a) * Math.cos(c) - Math.sin(a) * Math.cos(b) * Math.sin(c), -Math.cos(a) * Math.sin(c) - Math.sin(a) * Math.cos(b) * Math.cos(c), Math.sin(a) * Math.sin(b) ];
		S[1] = [ Math.sin(a) * Math.cos(c) + Math.cos(a) * Math.cos(b) * Math.sin(c), -Math.sin(a) * Math.sin(c) + Math.cos(a) * Math.cos(b) * Math.cos(c), -Math.cos(a) * Math.sin(b) ];
		S[2] = [ Math.sin(b) * Math.sin(c), Math.sin(b) * Math.cos(c), Math.cos(b) ];
		return S;
	}
	function SetAttributesRotated(polygonePicture, InfinitesimalMatrix) {
		EulerMatrixForRotation = MatrixProduct(InfinitesimalMatrix, EulerMatrixForRotation);
		EulerMatrixForRotation = MatrixOrthogonalization(EulerMatrixForRotation);
		// S = EulerMatrix(a, b, c);
		// alert(InfinitesimalMatrix);
		S = EulerMatrixForRotation;
		// alert(EulerMatrixForRotation);
		polygoneDownRotated = new Array();
		polygoneUpRotated = new Array();

		for (var i = 0; i < polygoneDown.length; i++) {
			polygoneDownRotated.push([ 0, 0, 0 ]);
			polygoneUpRotated.push([ 0, 0, 0 ]);
			shiftX = (polygoneUp[1][0] + polygoneUp[2][0] + polygoneUp[3][0] + polygoneUp[4][0]) / 4;
			shiftY = (polygoneUp[1][2]);

			for (var j = 0; j < 3; j++) {
				polygoneDownRotated[i][j] = S[j][0] * (polygoneDown[i][0] - shiftX) + S[j][1] * (polygoneDown[i][1] - shiftY) + S[j][2] * polygoneDown[i][2];
				polygoneUpRotated[i][j] = S[j][0] * (polygoneUp[i][0] - shiftX) + S[j][1] * (polygoneUp[i][1] - shiftY) + S[j][2] * polygoneUp[i][2];

			}

		}

		for (var i = 0; i < polygoneDown.length - 1; i++) {
			bodyCoord = new Array();

			bodyCoord.push(centerX + scale * polygoneDownRotated[i][0] * perspectiveDistance / (perspectiveDistance + polygoneDownRotated[i][2]));
			bodyCoord.push(centerY - scale * polygoneDownRotated[i][1] * perspectiveDistance / (perspectiveDistance + polygoneDownRotated[i][2]));
			bodyCoord.push(centerX + scale * polygoneDownRotated[i + 1][0] * perspectiveDistance / (perspectiveDistance + polygoneDownRotated[i + 1][2]));
			bodyCoord.push(centerY - scale * polygoneDownRotated[i + 1][1] * perspectiveDistance / (perspectiveDistance + polygoneDownRotated[i + 1][2]));
			bodyCoord.push(centerX + scale * polygoneUpRotated[i + 1][0] * perspectiveDistance / (perspectiveDistance + polygoneUpRotated[i + 1][2]));
			bodyCoord.push(centerY - scale * polygoneUpRotated[i + 1][1] * perspectiveDistance / (perspectiveDistance + polygoneUpRotated[i + 1][2]));
			bodyCoord.push(centerX + scale * polygoneUpRotated[i][0] * perspectiveDistance / (perspectiveDistance + polygoneUpRotated[i][2]));
			bodyCoord.push(centerY - scale * polygoneUpRotated[i][1] * perspectiveDistance / (perspectiveDistance + polygoneUpRotated[i][2]));

			polygonePicture[i].setAttrs({
				points : bodyCoord
			});
		}

		// kk = 2;

		// $('p').text(Math.pow(polygoneDownRotated[kk+1][0]-polygoneDownRotated[kk][0],2)+Math.pow(polygoneDownRotated[kk+1][1]-polygoneDownRotated[kk][1],2)+Math.pow(polygoneDownRotated[kk+1][2]-polygoneDownRotated[kk][2],2))
		/*
		if (dt < 0.1) {
			$('p').text('det[')
			for (kk = 0; kk < 3; kk++) {
				$('p').append('[')
				for (i = 0; i < 3; i++) {
					$('p').append(polygoneDownRotated[kk + 1][i] - polygoneDownRotated[kk][i])
					if (i < 2) {
						$('p').append(', ')
					}
				}
				$('p').append(']')
				if (kk < 2) {
					$('p').append(', ')
				}

			}
			$('p').append(']')

		}
		*/
	}

	function ControlBar() {

		var sliderAngle = new Kinetic.Rect({
			x : pieceX - sliderWidth / 2,
			y : pieceY + 2 * pieceWidth - sliderWidth / 2,
			width : sliderParamLength + sliderWidth,
			height : sliderWidth,
			fill : sliderColor,
			opacity : 0.5,
			stroke : 'black',
			strokeWidth : 2,
			cornerRadius : sliderWidth / 2,
		});

		var circleAngle = new Kinetic.Circle({
			x : sliderAngleX + (Math.PI - angleFoldDesire[1]) * sliderParamLength / Math.PI,
			y : pieceY + 2 * pieceWidth,
			radius : sliderWidth / 2,
			fill : 'red',
			stroke : 'black',
			strokeWidth : 0,
			draggable : true,
			dragBoundFunc : function(pos) {
				this.moveToTop();

				if ((pos.x > sliderAngleX) && (pos.x < sliderAngleX + sliderParamLength)) {
					positionX = pos.x
				} else if (pos.x > (2 * sliderAngleX + sliderParamLength) / 2) {
					positionX = sliderAngleX + sliderParamLength;
				} else {
					positionX = sliderAngleX
				}
				angleFoldDesire[1] = (Math.PI - (positionX - sliderAngleX) * Math.PI / sliderParamLength);
				// $('p').text((Math.PI - angleFoldDesire[1]) / 2 / Math.PI *
				// 360);
				paramString[0] = ((Math.PI - angleFoldDesire[1]) / 2 / Math.PI * 360).toFixed(3);
				document.getElementById("inputAngle").value = paramString;
				// ((Math.PI - angleFoldDesire[1]) / 2 / Math.PI *
				// 360).toFixed(3);
				anim.start();
				draw();

				return {
					x : positionX,
					y : this.getAbsolutePosition().y
				}

			}

		});
		$("#inputAngle").on('focus', function(e) {
			$(document).off('keydown');
		});
		$("#inputAngle").on('blur', function(e) {
			keyDownOn();
		});

		$("#inputAngle").keyup(function(e) {
			if (e.keyCode == 13) {
				keyDownOn();
				$("#inputAngle").blur();
				paramString = this.value.split(',').map(Number)

				if ((paramString[0] <= 180) && (paramString[0] >= 0)) {
					angleFoldDesire[1] = Math.PI - paramString[0] * Math.PI / 180;
					circleAngle.setX(sliderAngleX + paramString[0] * sliderParamLength / 180);
					stageControl.add(layerControl);
					anim.start();
					draw();
					stageControl.add(layerControl);

				}

				if ((paramString[1] >= 0) && (paramString[1] <= pieceLength / scale)) {
					polygoneRawUp[1][0] = paramString[1];
				}

				if ((paramString[2] >= paramString[1]) && (paramString[2] <= pieceLength / scale)) {
					polygoneRawUp[2][0] = paramString[2];

				}

				if ((paramString[3] >= paramString[2]) && (paramString[3] <= pieceLength / scale)) {
					polygoneRawUp[3][0] = paramString[3];
				}

				if ((paramString[4] >= 0) && (paramString[4] <= pieceLength / scale)) {
					polygoneRawDown[1][0] = paramString[4];
				}

				if ((paramString[5] >= paramString[4]) && (paramString[5] <= pieceLength / scale)) {
					polygoneRawDown[2][0] = paramString[5];
				}

				if ((paramString[6] >= paramString[5]) && (paramString[6] <= pieceLength / scale)) {
					polygoneRawDown[3][0] = paramString[6];
				}

				circleLeftUp.setX(polygoneRawUp[1][0] * scale + pieceX);
				circleRightUp.setX(polygoneRawUp[2][0] * scale + pieceX);
				circleRightRightUp.setX(polygoneRawUp[3][0] * scale + pieceX);
				circleLeftDown.setX(polygoneRawDown[1][0] * scale + pieceX);
				circleRightDown.setX(polygoneRawDown[2][0] * scale + pieceX);
				circleRightRightDown.setX(polygoneRawDown[3][0] * scale + pieceX);
				anim.start();
				draw();
				stageControl.add(layerControl);
			}
		});

		layerControl.add(sliderAngle);
		layerControl.add(circleAngle);
		stageControl.add(layerControl);

		var sliderUp = new Kinetic.Rect({
			x : pieceX - sliderWidth / 2,
			y : pieceY - sliderWidth / 2,
			width : pieceLength + sliderWidth,
			height : sliderWidth,
			opacity : 0.5,
			fill : sliderColor,
			stroke : 'black',
			strokeWidth : 2,
			cornerRadius : sliderWidth / 2,
		});

		var sliderDown = new Kinetic.Rect({
			x : pieceX - sliderWidth / 2,
			y : pieceY + pieceWidth - sliderWidth / 2,
			width : pieceLength + sliderWidth,
			height : sliderWidth,
			opacity : 0.5,
			fill : sliderColor,
			stroke : 'black',
			strokeWidth : 2,
			cornerRadius : sliderWidth / 2
		});

		var circleLeftUp = new Kinetic.Circle({
			x : pieceX + pieceLength / 2 - pieceWidth,
			y : pieceY,
			radius : sliderWidth / 2,
			fill : 'red',
			stroke : 'black',
			strokeWidth : 0,
			draggable : true,
			dragBoundFunc : function(pos) {
				this.moveToTop();

				if ((pos.x > pieceX) && (pos.x < pieceX + pieceLength) && (pos.x < circleRightUp.getAbsolutePosition().x)) {
					positionX = pos.x
				} else if (pos.x > (circleRightUp.getAbsolutePosition().x + pieceX) / 2) {
					positionX = circleRightUp.getAbsolutePosition().x
				} else {
					positionX = pieceX
				}
				//$('p').text(positionX - pieceX);
				polygoneRawUp[1][0] = (positionX - pieceX) / scale;
				anim.start();
				draw();
				paramString[1] = polygoneRawUp[1][0].toFixed(3);
				document.getElementById("inputAngle").value = paramString;

				return {
					x : positionX,
					y : this.getAbsolutePosition().y
				}

			}

		});

		var circleRightUp = new Kinetic.Circle({
			x : pieceX + pieceLength / 2 - pieceWidth + lengthUp[0] * scale,
			y : pieceY,
			radius : sliderWidth / 2,
			fill : 'red',
			stroke : 'black',
			strokeWidth : 0,
			draggable : true,
			dragBoundFunc : function(pos) {

				this.moveToTop();
				if ((pos.x > pieceX) && (pos.x < pieceX + pieceLength) && (pos.x > circleLeftUp.getAbsolutePosition().x) && (pos.x < circleRightRightUp.getAbsolutePosition().x)) {
					positionX = pos.x
				} else if (pos.x > (circleLeftUp.getAbsolutePosition().x + circleRightRightUp.getAbsolutePosition().x) / 2) {
					positionX = circleRightRightUp.getAbsolutePosition().x
				} else {
					positionX = circleLeftUp.getAbsolutePosition().x
				}
				$('p').text(positionX - pieceX);
				polygoneRawUp[2][0] = (positionX - pieceX) / scale;
				anim.start();
				draw();
				paramString[2] = polygoneRawUp[2][0].toFixed(3);
				document.getElementById("inputAngle").value = paramString;
				return {
					x : positionX,
					y : this.getAbsolutePosition().y
				}
			}

		});

		var circleRightRightUp = new Kinetic.Circle({
			x : pieceX + pieceLength / 2 - pieceWidth + lengthUp[0] * scale + lengthUp[1] * scale,
			y : pieceY,
			radius : sliderWidth / 2,
			fill : 'red',
			stroke : 'black',
			strokeWidth : 0,
			draggable : true,
			dragBoundFunc : function(pos) {
				this.moveToTop();
				if ((pos.x > pieceX) && (pos.x < pieceX + pieceLength) && (pos.x > circleRightUp.getAbsolutePosition().x)) {
					positionX = pos.x
				} else if (pos.x > (pieceX + pieceLength + circleRightUp.getAbsolutePosition().x) / 2) {
					positionX = pieceX + pieceLength
				} else {
					positionX = circleRightUp.getAbsolutePosition().x
				}
				$('p').text(positionX - pieceX);
				polygoneRawUp[3][0] = (positionX - pieceX) / scale;
				anim.start();
				draw();
				paramString[3] = polygoneRawUp[3][0].toFixed(3);
				document.getElementById("inputAngle").value = paramString;
				return {
					x : positionX,
					y : this.getAbsolutePosition().y
				}
			}

		});

		var circleLeftDown = new Kinetic.Circle({
			x : pieceX + pieceLength / 2 - 1.5 * pieceWidth,
			y : pieceY + pieceWidth,
			radius : sliderWidth / 2,
			fill : 'red',
			stroke : 'black',
			strokeWidth : 0,
			draggable : true,
			dragBoundFunc : function(pos) {
				this.moveToTop();
				if ((pos.x > pieceX) && (pos.x < pieceX + pieceLength) && (pos.x < circleRightDown.getAbsolutePosition().x)) {
					positionX = pos.x
				} else if (pos.x > (circleRightDown.getAbsolutePosition().x + pieceX) / 2) {
					positionX = circleRightDown.getAbsolutePosition().x
				} else {
					positionX = pieceX
				}
				$('p').text(positionX - pieceX);
				polygoneRawDown[1][0] = (positionX - pieceX) / scale;
				anim.start();
				draw();
				paramString[4] = polygoneRawDown[1][0].toFixed(3);
				document.getElementById("inputAngle").value = paramString;

				return {
					x : positionX,
					y : this.getAbsolutePosition().y
				}
			}

		});
		var circleRightDown = new Kinetic.Circle({
			x : pieceX + pieceLength / 2 - 1.5 * pieceWidth + lengthDown[0] * scale,
			y : pieceY + pieceWidth,
			radius : sliderWidth / 2,
			fill : 'red',
			stroke : 'black',
			strokeWidth : 0,
			draggable : true,
			dragBoundFunc : function(pos) {
				this.moveToTop();
				if ((pos.x > pieceX) && (pos.x < circleRightRightDown.getAbsolutePosition().x) && (pos.x > circleLeftDown.getAbsolutePosition().x)) {
					positionX = pos.x
				} else if (pos.x > (circleRightRightDown.getAbsolutePosition().x + circleLeftDown.getAbsolutePosition().x) / 2) {
					positionX = circleRightRightDown.getAbsolutePosition().x
				} else {
					positionX = circleLeftDown.getAbsolutePosition().x
				}
				$('p').text(positionX - pieceX);
				polygoneRawDown[2][0] = (positionX - pieceX) / scale;
				anim.start();
				draw();
				paramString[5] = polygoneRawDown[2][0].toFixed(3);
				document.getElementById("inputAngle").value = paramString;
				return {
					x : positionX,
					y : this.getAbsolutePosition().y
				}
			}

		});
		var circleRightRightDown = new Kinetic.Circle({
			x : pieceX + pieceLength / 2 - 1.5 * pieceWidth + lengthDown[0] * scale + lengthDown[1] * scale,
			y : pieceY + pieceWidth,
			radius : sliderWidth / 2,
			fill : 'red',
			stroke : 'black',
			strokeWidth : 0,
			draggable : true,
			dragBoundFunc : function(pos) {
				this.moveToTop();

				if ((pos.x > pieceX) && (pos.x < pieceX + pieceLength) && (pos.x > circleRightDown.getAbsolutePosition().x)) {
					positionX = pos.x
				} else if (pos.x > (pieceX + pieceLength + circleLeftDown.getAbsolutePosition().x) / 2) {
					positionX = pieceX + pieceLength
				} else {
					positionX = circleRightDown.getAbsolutePosition().x
				}
				//$('p').text(positionX - pieceX);
				polygoneRawDown[3][0] = (positionX - pieceX) / scale;
				anim.start();
				draw();
				paramString[6] = polygoneRawDown[3][0].toFixed(3);
				document.getElementById("inputAngle").value = paramString;
				return {
					x : positionX,
					y : this.getAbsolutePosition().y
				}
			}

		});

		/*	var lineLeft = new Kinetic.Line({
				points : [ circleLeftUp.getAbsolutePosition().x, circleLeftUp.getAbsolutePosition().y, circleLeftDown.getAbsolutePosition().x, circleLeftDown.getAbsolutePosition().y ],
				stroke : 'red',
				strokeWidth : sliderWidth,
				lineCap : 'round',
				lineJoin : 'round',
				draggable : true,
				dragBoundFunc : function(pos) {
					$('p').text(this.getPosition().x)
					return {
						x : pos.x,
						y : this.getAbsolutePosition().y
					}
				}
			});*/
		circleArray = [ circleLeftUp, circleLeftDown, circleRightUp, circleRightDown, circleRightRightUp, circleRightRightDown ];
		// lineArray = [ lineLeft ];
		for (var i = 0; i < 3; i++) {
			polygoneRawUp[i + 1][0] = (circleArray[2 * i].getAbsolutePosition().x - pieceX) / scale;
			polygoneRawDown[i + 1][0] = (circleArray[2 * i + 1].getAbsolutePosition().x - pieceX) / scale;

		}
		layerControl.add(sliderUp);
		layerControl.add(sliderDown);
		/*	for (var i = 0; i < lineArray.length; i++) {

				layerControl.add(lineArray[i]);

				lineArray[i].on('mouseover', function() {
					document.body.style.cursor = 'pointer';
				});
				lineArray[i].on('mouseout', function() {
					document.body.style.cursor = 'default';
				});
			}*/
		for (var i = 0; i < 6; i++) {
			layerControl.add(circleArray[i]);

			circleArray[i].on('mouseover', function() {
				document.body.style.cursor = 'pointer';
			});
			circleArray[i].on('mouseout', function() {
				document.body.style.cursor = 'default';
			});
		}

		circleAngle.on('mouseover', function() {
			document.body.style.cursor = 'pointer';
		});
		circleAngle.on('mouseout', function() {
			document.body.style.cursor = 'default';
		});
		// stageControl.add(layerControl);
	}

	/*
	  matrix = new Array();
	  
	  for (var i=0;i<3;i++){
	  matrix[i]=[polygoneDown[i+1][0]-polygoneDown[i][0],polygoneDown[i+1][1]-polygoneDown[i][1],polygoneDown[i+1][2]-polygoneDown[i][2]];
	  $('p').append(matrix[i]+'],['); }
	 */

});