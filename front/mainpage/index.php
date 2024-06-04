<!DOCTYPE html>



<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Title</title>
    <!-- <link rel="stylesheet" href="style.css"> -->
    <style>
        body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    }
    .navbar {
        background-color: #333;
        overflow: hidden;
    }
    .navbar a {
        float: left;
        display: block;
        color: white;
        text-align: center;
        padding: 14px 20px;
        text-decoration: none;
    }
    .navbar a:hover {
        background-color: #ddd;
        color: black;
    }
    .navbar .login {
        float: right;
        background-color: #4CAF50;
        color: white;
    }
    .container {
        padding: 20px;
    }
    .main-content {
        background: white;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }
    </style>
</head>
<body>
    <div class="navbar">
        <a href="#">Home</a>
        <a href="#">Transakcje</a>
        <a href="#">Kontakt</a>
        <a href="#" class="login">Log in</a>
    </div>
    <div class="container">
        <div class="main-content">
            <h1>Welcome to the Transaction Service</h1>
            <p>Here you can manage your transactions quickly and securely. Log in to get started.</p>
        </div>
    </div>
</body>
</html>
