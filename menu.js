  $( document ).ready(function() 
  {
    citeLink = `david.wf`;
	menuName=['About&nbsp;me', 'Fun&nbsp;science', 'Linkage', 'Mandelbrot', 'Kalman&nbsp;filter'];
	menuLink=[citeLink , citeLink+'/funscience', citeLink + '/linkage', citeLink + '/mandelbrot', citeLink + '/kalmanfilter']
	stringMenuOn=$( "#menu").html();
    stringMenuBeginning=
		'<table width="100%" height="1" bgcolor="#FFFFFF" cellspacing="0"  border="0">'+
		'<tr valign="center">';
	stingMenuEnding=
		'<td bgcolor="#000000"></td>'+
		'</tr>'+
		'</table>';
	stirngMenuMiddle='';
	for (i=0;i<menuName.length;i++)
	{
		if (menuName[i]==stringMenuOn)
		{
			stringBackgroundColor='#888888'
		}
		else
		{
			stringBackgroundColor='#000000'
		}
		stirngMenuMiddle+='<td class="header" bgcolor="'
	    stirngMenuMiddle+=stringBackgroundColor;
		stirngMenuMiddle+='" align="center" width="1"><div><a class="header" href="http://';
		stirngMenuMiddle+=menuLink[i];
		stirngMenuMiddle+='">';
		stirngMenuMiddle+=menuName[i];
		stirngMenuMiddle+='</a></div></td>'
	}
	$( "#menu" ).html
	(stringMenuBeginning+stirngMenuMiddle+stingMenuEnding);
  
  });
