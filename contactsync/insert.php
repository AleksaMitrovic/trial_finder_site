<?php
header("Access-Control-Allow-Origin: *");
error_reporting(E_ALL);
ini_set('display_errors', 1);
 
    $contact_name=$_POST['contact_name'];
    $contact_number=$_POST['contact_number'];

    $conn = mysqli_connect("localhost","root","311019867828211","contacts") or die ("could not connect database");

    
    $q=mysqli_query($conn,"INSERT INTO `contacts` (`contact_name`,`contact_number`) VALUES ('$contact_name','$contact_number')");
    if($q)
    echo "success";
    else
    echo "error";
 ?>