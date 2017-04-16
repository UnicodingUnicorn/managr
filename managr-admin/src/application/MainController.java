package application;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.net.URL;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

import javafx.beans.binding.When;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.util.Callback;

import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.ChoiceBox;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableColumn.CellDataFeatures;
import javafx.scene.control.TableView;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.layout.GridPane;

public class MainController implements Initializable{
	@FXML
	TableView<ObservableList<String>> dataTable;
	@FXML
	ChoiceBox<String> tablesChoice;
	
	@FXML
	TextArea logs;
	
	@FXML
	Button insertButton;
	@FXML
	Button modifyButton;
	@FXML
	Button deleteButton;
	
	@FXML
	Button bulkUploadButton;
	@FXML
	CheckBox overwriteCheckbox;
	@FXML
	Button exportButton;
	
	@FXML
	TextField usernameField;
	@FXML 
	PasswordField passwordField;
	
	@FXML
	TextField sqlInput;
	@FXML
	Button executeSQLButton;
	
	private String dbUrl = "jdbc:mysql://localhost:3306/";
	private String dbName = "managr";
	private String dbUsername = "root";
	private String dbPassword = "";
	
	private Connection connection;
	private Statement statement;
	
	private ObservableList<String> tables;
	private int selected = -1;
	
	@Override
	public void initialize(URL fxmlFilelocation, ResourceBundle resources){
		assert dataTable != null : "dataTable does not exist";
		assert tablesChoice != null : "tablesChoice does not exist";
		assert logs != null : "logs does not exist";
		assert insertButton != null : "insertButton does not exist";
		assert modifyButton != null : "modifyButton does not exist";
		assert deleteButton != null : "deleteButton does not exist";
		assert bulkUploadButton != null : "bulkUploadButton does not exist";
		assert overwriteCheckbox != null : "overwriteCheckbox does not exist";
		assert exportButton != null : "exportButton does not exist";
		assert usernameField != null : "usernameField does not exist";
		assert passwordField != null : "passwordField does not exist";
		assert sqlInput != null : "sqlInput does not exist";
		assert executeSQLButton != null : "executeSQLButton does not exist";
		
		tables = FXCollections.observableArrayList();
		tablesChoice.getSelectionModel().selectedIndexProperty().addListener((ov, old_value, new_value) -> {
				try{
					selected = (int) new_value;
					ResultSet rs = statement.executeQuery("SELECT * FROM " + tables.get((int)new_value));
					ResultSetMetaData metadata = rs.getMetaData();
					List<String> headers = new ArrayList<>();
					dataTable.getColumns().clear();
					for(int i = 1; i <= metadata.getColumnCount(); i++){
						final int j = i-1;
						TableColumn<ObservableList<String>, String> column = new TableColumn<>(metadata.getColumnName(i));
						column.setCellValueFactory(new Callback<CellDataFeatures<ObservableList<String>, String>, ObservableValue<String>>(){
							public ObservableValue<String> call(CellDataFeatures<ObservableList<String>, String> param){
								return new SimpleStringProperty(param.getValue().get(j).toString());
							}
						});
						dataTable.getColumns().add(column);
						headers.add(metadata.getColumnName(i));
					}
					ObservableList<ObservableList<String>> data = FXCollections.observableArrayList();
					while(rs.next()){
						ObservableList<String> row = FXCollections.observableArrayList();
						for(int i = 0; i < headers.size(); i++){
							row.add(rs.getString(headers.get(i)));
						}
						data.add(row);
					}
					dataTable.setItems(data);
				}catch(Exception e){
					log(e.getMessage());
				}
		
		});
		
		logs.setWrapText(true);
		
		insertButton.setOnAction((event) -> {
			GridPane grid = new GridPane();
			grid.setHgap(10);
			grid.setVgap(10);
			grid.setPadding(new Insets(20, 150, 10, 10));
			
			ArrayList<TextField> fields = new ArrayList<>();
			
			int i;
			for(i = 0; i < dataTable.getColumns().size(); i++){
				grid.add(new Label(dataTable.getColumns().get(i).getText()), 0, i);
				TextField entry = new TextField();
				fields.add(entry);
				grid.add(entry, 1, i);
			}
			Button done = new Button("Done");
			done.setDefaultButton(true);
			done.setOnAction((doneEvent) -> {
				String query = "INSERT INTO " + tables.get(selected) + " (";
				for(int j = 0; j < fields.size(); j++){
					if(fields.get(j).getText() != ""){
						query += dataTable.getColumns().get(j).getText() + ", ";
					}
				}
				query = query.substring(0, query.length()-2);
				query += ") VALUES (";
				for(int j = 0; j < fields.size(); j++){
					if(fields.get(j).getText() != ""){
						String value = fields.get(j).getText();
						try{
							int test = Integer.parseInt(value);
							query += value + ", ";
						}catch(NumberFormatException e){
							query += "'" + value +"', ";
						}
					}
				}
				query = query.substring(0, query.length()-2);
				query += ");";
				
				try{
					statement.executeUpdate(query);
					log("Row inserted!");
					updateTable();
				}catch(SQLException e){
					log(e.getMessage());
				}
				
				((Stage) done.getScene().getWindow()).close();
			});
			grid.add(done, 0, i+1);
			
			Button cancel = new Button("Cancel");
			cancel.setCancelButton(true);
			cancel.setOnAction((cancelEvent) -> {
				((Stage) cancel.getScene().getWindow()).close();
			});
			grid.add(cancel, 1, i+1);
			
			Stage modalStage = new Stage();
			modalStage.setScene(new Scene(grid));
			modalStage.setTitle("Insert entry");
			modalStage.initModality(Modality.WINDOW_MODAL);
			modalStage.initOwner(insertButton.getScene().getWindow());
			modalStage.show();
		});
		
		modifyButton.setOnAction((event) -> {
			ObservableList<String> editedRow = dataTable.getSelectionModel().getSelectedItem();
			if(editedRow != null){
				GridPane grid = new GridPane();
				grid.setHgap(10);
				grid.setVgap(10);
				grid.setPadding(new Insets(20, 150, 10, 10));
				
				ArrayList<TextField> fields = new ArrayList<>();
				
				int i;
				for(i = 0; i < dataTable.getColumns().size(); i++){
					grid.add(new Label(dataTable.getColumns().get(i).getText()), 0, i);
					TextField entry = new TextField();
					entry.setText(editedRow.get(i));
					fields.add(entry);
					grid.add(entry, 1, i);
				}
				Button done = new Button("Done");
				done.setDefaultButton(true);
				done.setOnAction((doneEvent) -> {
					String query = "UPDATE " + tables.get(selected) + " SET ";
					for(int j = 0; j < fields.size(); j++){
						String value = fields.get(j).getText();
						if(value != ""){
							query += dataTable.getColumns().get(j).getText() + " = ";
							try{
								int test = Integer.parseInt(value);
								query += value + ", ";
							}catch(NumberFormatException e){
								query += "'" + value +"', ";
							}
						}
					}
					query = query.substring(0, query.length()-2);
					query += " WHERE ";
					for(int j = 0; j < editedRow.size(); j++){
						query += dataTable.getColumns().get(j).getText() + " = ";
						try{
							int test = Integer.parseInt(editedRow.get(j));
							query += editedRow.get(j) + " AND ";
						}catch(NumberFormatException e){
							query += "'" + editedRow.get(j) +"' AND ";
						}
					}
					query = query.substring(0, query.length()-5);
					query += ";";
					
					try{
						statement.executeUpdate(query);
						log("Row updated!");
						updateTable();
					}catch(SQLException e){
						log(e.getMessage());
					}
					
					((Stage) done.getScene().getWindow()).close();
				});
				grid.add(done, 0, i+1);
				
				Button cancel = new Button("Cancel");
				cancel.setCancelButton(true);
				cancel.setOnAction((cancelEvent) -> {
					((Stage) cancel.getScene().getWindow()).close();
				});
				grid.add(cancel, 1, i+1);
				
				Stage modalStage = new Stage();
				modalStage.setScene(new Scene(grid));
				modalStage.setTitle("Insert entry");
				modalStage.initModality(Modality.WINDOW_MODAL);
				modalStage.initOwner(insertButton.getScene().getWindow());
				modalStage.show();
			}else{
				log("Please select something!");
			}
		});
		
		deleteButton.setOnAction((event) -> {
			try{
				ObservableList<String> entry = dataTable.getSelectionModel().getSelectedItem();
				String query = "DELETE FROM " + tables.get(selected) + " WHERE ";
				for(int i = 0; i < entry.size(); i++){
					query += dataTable.getColumns().get(i).getText() + " = ";
					try{
						int test = Integer.parseInt(entry.get(i));
						query += entry.get(i) + " AND ";
					}catch(NumberFormatException e){
						query += "'" + entry.get(i) + "' AND ";
					}
				}
				query = query.substring(0, query.length() - 4);
				query += ";";
				//log(query);
				try{
					statement.executeUpdate(query);
					log("Deleted!");
					updateTable();
				}catch(SQLException e){
					log(e.getMessage());
				}
			}catch(NullPointerException e){
				log("Please select something!");
			}
		});
		
		bulkUploadButton.setOnAction((event) -> {
			FileChooser chooser = new FileChooser();
			chooser.setTitle("Choose import file");
			chooser.setInitialDirectory(new File(System.getProperty("user.home")));
			chooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("CSV", "*.csv"));
			File file = chooser.showOpenDialog(bulkUploadButton.getScene().getWindow());
			try{
				FileReader reader = new FileReader(file.getAbsoluteFile());
				BufferedReader br = new BufferedReader(reader);
				String currentLine;
				ObservableList<ObservableList<String>> new_tables = FXCollections.observableArrayList();
				currentLine = br.readLine(); //Discount current line of headers
				while((currentLine = br.readLine()) != null){
					String[] values = currentLine.split(",");
					if(values.length != dataTable.getItems().get(0).size()){
						br.close();
						throw new Exception("Row count mismatch in data file");
					}else{
						ObservableList<String> row = FXCollections.observableArrayList();
						for(String value : values){
							row.add(value);
						}
						new_tables.add(row);
					}
				}
				br.close();
				if(overwriteCheckbox.isSelected())
					statement.executeUpdate("DELETE FROM " + tables.get(selected));
				for(ObservableList<String> row : new_tables){
					String query = "INSERT INTO " + tables.get(selected) + " VALUES (";
					for(String value : row){
						try{
							int test = Integer.parseInt(value); //Values can only be Integer, String or Datetime, which is a String anyway
							query += value + ", ";
						}catch(NumberFormatException e){
							query += "'" + value + "', ";
						}
					}
					query = query.substring(0, query.length() - 2); //Chop off last ,\w
					query += ");";
					//log(query);
					statement.executeUpdate(query);
				}
				log("Update complete");
				updateTable();
			}catch(Exception e){
				if(e.getMessage() != null)
					log(e.getMessage());
			}
		});
		
		exportButton.setOnAction((event) -> {
			FileChooser chooser = new FileChooser();
			chooser.setTitle("Choose export file");
			chooser.setInitialDirectory(new File(System.getProperty("user.home")));
			chooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("CSV", "*.csv"));
			chooser.setInitialFileName(tablesChoice.getItems().get(selected));
			File file = chooser.showSaveDialog(exportButton.getScene().getWindow());
			try{
				String data = "";
				for(TableColumn<ObservableList<String>, ?> col : dataTable.getColumns()){
					data += col.getText() + ",";
				}
				data += "\n";
				for(ObservableList<String> row : dataTable.getItems()){
					for(String entry : row){
						data += entry + ",";
					}
					data += "\n";
				}
				FileWriter fileWriter = new FileWriter(file.getAbsoluteFile());
				BufferedWriter bufferWriter = new BufferedWriter(fileWriter);
				bufferWriter.write(data);
				bufferWriter.close();
				fileWriter.close();
				log("File exported to " + file.getAbsoluteFile());
			}catch(Exception e){
				log(e.getMessage());
			}
		});
		
		usernameField.textProperty().addListener((observable, oldValue, newValue) -> {
			dbUsername = usernameField.getText();
			try{
				connection = DriverManager.getConnection(dbUrl + dbName, dbUsername, dbPassword);
				log("Logged in with " + dbUsername);
				statement = connection.createStatement();
			}catch(Exception e){
				log(e.getMessage());
			}
		});
		passwordField.textProperty().addListener((observable, oldValue, newValue) -> {
			dbPassword = passwordField.getText();
			try{
				connection = DriverManager.getConnection(dbUrl + dbName, dbUsername, dbPassword);
				log("Logged in with " + dbUsername);
				statement = connection.createStatement();
			}catch(Exception e){
				log(e.getMessage());
			}
		});
		
		executeSQLButton.setOnAction((event) -> {
			try{
				ResultSet rs = statement.executeQuery(sqlInput.getText());
				ResultSetMetaData metadata = rs.getMetaData();
				List<String> headers = new ArrayList<>();
				dataTable.getColumns().clear();
				for(int i = 1; i <= metadata.getColumnCount(); i++){
					final int j = i-1;
					TableColumn<ObservableList<String>, String> column = new TableColumn<>(metadata.getColumnName(i));
					column.setCellValueFactory(new Callback<CellDataFeatures<ObservableList<String>, String>, ObservableValue<String>>(){
						public ObservableValue<String> call(CellDataFeatures<ObservableList<String>, String> param){
							return new SimpleStringProperty(param.getValue().get(j).toString());
						}
					});
					dataTable.getColumns().add(column);
					headers.add(metadata.getColumnName(i));
				}
				ObservableList<ObservableList<String>> data = FXCollections.observableArrayList();
				while(rs.next()){
					ObservableList<String> row = FXCollections.observableArrayList();
					for(int i = 0; i < headers.size(); i++){
						row.add(rs.getString(headers.get(i)));
					}
					data.add(row);
				}
				dataTable.setItems(data);
			}catch(Exception e){
				log(e.getMessage());
			}
		});
		
		try{
			Class.forName("com.mysql.jdbc.Driver"); 
			connection = DriverManager.getConnection(dbUrl + dbName, dbUsername, dbPassword);
			log("Database connection established");
			statement = connection.createStatement();
			ResultSet rs = statement.executeQuery("SHOW TABLES");
			while(rs.next()){
				tables.add(rs.getString(1));
			}
			tablesChoice.setItems(tables);
			tablesChoice.getSelectionModel().selectFirst();
		}catch(Exception e){
			//log(getExceptionString(e));
			log(e.getMessage());
		}
	}
	
	private void updateTable(){
		try{
			ResultSet rs = statement.executeQuery("SELECT * FROM " + tables.get(selected));
			ResultSetMetaData metadata = rs.getMetaData();
			List<String> headers = new ArrayList<>();
			dataTable.getColumns().clear();
			for(int i = 1; i <= metadata.getColumnCount(); i++){
				final int j = i-1;
				TableColumn<ObservableList<String>, String> column = new TableColumn<>(metadata.getColumnName(i));
				column.setCellValueFactory(new Callback<CellDataFeatures<ObservableList<String>, String>, ObservableValue<String>>(){
					public ObservableValue<String> call(CellDataFeatures<ObservableList<String>, String> param){
						return new SimpleStringProperty(param.getValue().get(j).toString());
					}
				});
				dataTable.getColumns().add(column);
				headers.add(metadata.getColumnName(i));
			}
			ObservableList<ObservableList<String>> data = FXCollections.observableArrayList();
			while(rs.next()){
				ObservableList<String> row = FXCollections.observableArrayList();
				for(int i = 0; i < headers.size(); i++){
					row.add(rs.getString(headers.get(i)));
				}
				data.add(row);
			}
			dataTable.setItems(data);
		}catch(SQLException e){
			log(e.getMessage());
		}
		
	}
	
	private void log(String entry){
		logs.appendText(entry + "\n");
		logs.setScrollTop(Double.MAX_VALUE);
	}
}
