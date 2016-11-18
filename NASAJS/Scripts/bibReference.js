

var BibliographicReference =
      {
          resultString: "",
          bibCode: "",
          confidence: "",
          reference: "",
          resolved: null,

          Init: function (result)
          {
              BibliographicReference.resultString = this.CleanResponse(result);
              BibliographicReference.bibCode = this.resultString.substr(0, 19);
              BibliographicReference.confidence = this.GetConfidence();
              BibliographicReference.reference = this.GetReference();
          },

          CleanResponse: function(result)
          {
              var tags = ["<head><title>Resolved references</title></head>", "<UL>", "</UL>", "<li>", "</li>", "<body>", "</body>"];
              var cleanResult = result;

              for (var i = 0; i < tags.length; i++)
              {
                  cleanResult = cleanResult.replace(tags[i], "");
              }
            
              return cleanResult.trim();
          },

          GetBibCode: function ()
          {
              return BibliographicReference.bibCode;
          },

          GetConfidence: function ()
          {
              var confidenceStr = BibliographicReference.resultString.substr(20, 14);
              var confidence = confidenceStr.substr(12, 1);

              if (confidence == "0" || confidence == "5")
              {
                  this.resolved = false;
              }
              else if (confidence == "1" || confidence == "2" || confidence == "3" || confidence == "4")
              {
                  this.resolved = true;
              }

              return confidenceStr;
          },

          GetReference: function ()
          {
              return BibliographicReference.resultString.substr(40, BibliographicReference.resultString.length);
          }
      }


document.getElementById('btnSubmit').onclick = function ()
{
    var myInput = document.getElementById('txtCitations');
    var myResult = document.getElementById('lblResult');
    var citations = splitCitation(myInput);
    $("#loading").removeClass("hide");
    $("#myProgress").removeClass("hide");

    for (var i = 0; i < citations.length; i++)
    {
        if (citations[i].trim() != "")
        {
            getReference(citations[i]);
        }
    }

    $("#loading").addClass("hide");
    $(".panel").removeClass("hide");

    move()
}

function getReference(citation)
{
    var url = "http://adsres.cfa.harvard.edu:5000/cgi-bin/refcgi.py?resolvethose=" + encodeURIComponent(citation);

    $.ajax({
        url: url,
        data: encodeURIComponent(citation),
        dataType: 'text',
        success: displayResult,
        error: displayError,
        crossDomain: true
    });
}

function displayResult(data)
{

    BibliographicReference.Init(data);

    var result = BibliographicReference.bibCode + " | " + BibliographicReference.confidence + " | " + BibliographicReference.reference + "\n";
  
    if (BibliographicReference.resolved === true)
        document.getElementById("pnlResolved").innerText += result;
    else
        document.getElementById("pnlUnresolved").innerText += result;
}

function splitCitation(myInput)
{
    var splitCite = myInput.value.split('\n');
    return splitCite;
}

function displayError(e, x, settings, exception)
{
    $("#lblError").removeClass("hide");
    $(".panel").addClass("hide");

    var message;
    var statusErrorMap = {
        '400': "Server understood the request, but request content was invalid.",
        '401': "Unauthorized access.",
        '403': "Forbidden resource can't be accessed.",
        '500': "Internal server error.",
        '503': "Service unavailable."
    };

    if (x.status)
    {
        message = statusErrorMap[x.status];
        if (!message)
        {
            message = "Sorry, something went wrong. \n";
        }
    } else if (exception == 'parsererror')
    {
        message = "Error. Parsing JSON Request failed.\n";
    } else if (exception == 'timeout')
    {
        message = "Request Time out.\n";
    } else if (exception == 'abort')
    {
        message = "Request was aborted by the server.\n";
    } else
    {
        message = "Sorry, something went wrong. \n";
    }
  
    $("#lblError").text(message);

}

function move() {
    var elem = document.getElementById("myBar"); 
    var width = 1;
    var id = setInterval(frame, 10);
    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++; 
            elem.style.width = width + '%'; 
        }
    }
}
