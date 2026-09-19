<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database connection helper</title>
</head>
<body>
    <div>
        <?php 
            if (DB::connection()->getPdo()) {
                echo 'Successfully connected';
            }
        ?>
    </div>
</body>
</html>