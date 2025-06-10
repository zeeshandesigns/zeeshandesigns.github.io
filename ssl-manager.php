<?php
// SSL Certificate Token
$ssl_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFkNmlmTUlzRlpTcU5GTzdkWDBkeTltanBqX21qX1NnZ084bng2ektQTHcifQ.eyJpc3MiOiJodHRwczovL2V4dGVybmFsYXV0b3NzbC5zZXJ2aWNlLnNwYWNlc2hpcC5jb20iLCJuYmYiOjE3NDk1NTM4NjMsImlhdCI6MTc0OTU1Mzg2MywiZXhwIjoxNzQ5NjQwMjYzLCJhdWQiOlsiZXh0ZXJuYWxhdXRvc3NsIl0sInNjb3BlIjpbImV4dGVybmFsYXV0b3NzbC5leHRlcm5hbGF1dG9zc2wiLCJleHRlcm5hbGF1dG9zc2wudXNlci1pbnRlZ3JhdGlvbi1jcmVhdGUiXSwiY2xpZW50X2lkIjoiZXh0ZXJuYWwtc3NsLWNsaWVudCIsInN1YiI6ImRlMWNlZDY3LWIwNDYtNDQyZi1hMDA5LWNhYzQyYjQ0MjBjYyJ9.R-zKfftZt-1EuIujsIjVqsA2uz7t8vhIwBjIHlCseyIVDKc-m6pSrTtFRF_JwmzhBvuytYTGiSi6udJTHViv-qaZKZtnt4kjEUtVUkdUSQhmh5nb99-ox-ClmLXHIEjl2GSNdB0Qxh6HoZ9ylRgbBF0bjyN54BKIneI-V2q6kiVS3hDAYshWU07sMLtj_7Urabh8tU4bXPw46ks2y2CxW9jGBSsFPLwCw9lucfkC2pLARaWNhiCqxWtksORxf0km3WnA0Xgssicd-FDkzUi-hJCVJ5Rhmrb1XO5UaXCj_LRTvGSA67SgBVNdRf37Yx-tA4hmQln_ngnQMGcqep8ejA";

// Display the SSL Token on the page
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>SSL Manager</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
        }

        .container {
            max-width: 600px;
            margin: auto;
        }

        .token-box {
            background: #f4f4f4;
            padding: 20px;
            border-radius: 8px;
            word-break: break-all;
        }

        h1 {
            color: #2c3e50;
        }

        label {
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>SSL Certificate Token</h1>
        <label for="ssl-token">Your SSL Token:</label>
        <div class="token-box" id="ssl-token">
            <?php echo htmlspecialchars($ssl_token); ?>
        </div>
    </div>
</body>

</html>