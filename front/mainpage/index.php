<!DOCTYPE html>

<?

    require 'steamauth/steamauth.php';
    require 'steamauth/userInfo.php';

    if (isset($_SESSION['steamid'])) {
        $id = $_SESSION['steamid'];
    } else {
        # Not logged in
    }

?>


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
        <? if (isset($_SESSION['steamid'])) { ?>
            <div class="dropdown">
            <button class="dropbtn">
                <img src="<? $steamprofile['avatar']; ?>" alt="Avatar" class="profile-img">
                <span class="profile-text"><? $steamprofile['personaname']; ?></span>
            </button>
            <div class="dropdown-content">
                <a href="#">Option 1</a>
                <a href="#">Option 2</a>
                <a href="#">Option 3</a>
                <a href="steamauth/logout.php">Logout</a>
            </div>
            </div>
            
            <!-- <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                    <img class="img-rounded" src="<? $steamprofile['avatar']; ?>"> <b> <? $steamprofile['personaname']; ?> </b> <b class="caret"> </b> 
                </a>
                    <span class="dropdown-arrow"></span>
                    <ul class="dropdown-menu">
                    <li><a href="#"> Option 1 </a></li>
                    <li><a href="#"> Option 2 </a></li>
                    <li><a href="#"> Option 3 </a></li>
                    <li><a href="#"> Option 4 </a></li>
                    <li class="divider"></li>
                    <li><a href="steamauth/logout.php">Logout</a></li>
                </ul>
            </li> -->
        <?} else {?>
            <!-- <a href="#" class="login">Log in</a> -->
            <a href="#" class="login"><? echo loginbutton(); ?></a>
        <? } ?>
    </div>
    <div class="container">
        <div class="main-content">
            <h1>Welcome to the Transaction Service</h1>
            <p>Here you can manage your transactions quickly and securely. Log in to get started.</p>
        </div>
    </div>
</body>
</html>
