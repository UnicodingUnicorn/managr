//Java admin program, cos I have to
import java.sql.*;


public class admin {
  public static void main(String args[]){

    try{
      Class.forName("com.mysql.jdbc.Driver");

    }catch(Exception e){
      e.printStackTrace();
    }
  }
}
