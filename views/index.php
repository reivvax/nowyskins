<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Title</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="navbar">
        <a href="#">Home</a>
        <a href="#">Transakcje</a>
        <a href="#">Kontakt</a>
        <?php if (isset($_SESSION['steamid'])) { ?>
            <div class="dropdown">
                <button class="dropbtn">
                    <img src="<?php echo $steamprofile['avatar']; ?>" alt="Avatar" class="profile-img">
                    <span class="profile-text"> <?php echo $steamprofile['personaname']; ?> </span>
                    <span class="caret">&#9660;</span>
                </button>
                <div class="dropdown-content">
                    <a href="#">Option 1</a>
                    <a href="#">Option 2</a>
                    <a href="#">Option 3</a>
                    <a href="steamauth/logout.php">Logout</a>
                </div>
            </div>
        <?php } else {?>
            <?php echo loginbutton(); ?>
        <?php } ?>
    </div>
    <div class="container">
        <div class="main-content">
            <h1>Welcome to the Transaction Service</h1>
            <p>Here you can manage your transactions quickly and securely. Log in to get started.</p>
        </div>
    </div>
</body>
</html>
