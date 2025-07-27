<?php
// api.php
session_start(); // Start the session for user authentication

// Include database configuration
require_once 'config.php';

// Set header to return JSON response
header('Content-Type: application/json');

// In a real application, you would get the user_id from the session
// For demonstration purposes, we'll hardcode it to 1.
// REPLACE THIS WITH ACTUAL SESSION-BASED USER ID FETCHING
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1; // Fallback to 1 if not set

// Check if user_id is valid (e.g., exists in session)
if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access. Please log in.']);
    exit();
}

// Check the action requested by the client
if (!isset($_POST['action'])) {
    echo json_encode(['success' => false, 'message' => 'No action specified.']);
    exit();
}

$action = $_POST['action'];

switch ($action) {
    case 'fetch_customer_data':
        // This action would typically be used if JS needs to refresh ALL data via an API call
        // However, in our setup, initial data is passed directly via PHP in index.php
        // This block is here for completeness if you decide to change the architecture.
        $sql = "SELECT username, email, gender, phone, address, city, state, pincode,
                       enable_notifications, email_updates, sms_alerts, language,
                       bank_name, account_number, ifsc_code, upi_id,
                       total_games_played, total_hours_played, last_played_date
                FROM customers WHERE id = ?";

        if ($stmt = mysqli_prepare($conn, $sql)) {
            mysqli_stmt_bind_param($stmt, "i", $user_id);
            if (mysqli_stmt_execute($stmt)) {
                $result = mysqli_stmt_get_result($stmt);
                if (mysqli_num_rows($result) == 1) {
                    $customer_data = mysqli_fetch_assoc($result);
                    // Convert tinyint(1) to boolean for JS consumption
                    $customer_data['enable_notifications'] = (bool)$customer_data['enable_notifications'];
                    $customer_data['email_updates'] = (bool)$customer_data['email_updates'];
                    $customer_data['sms_alerts'] = (bool)$customer_data['sms_alerts'];
                    $customer_data['total_games_played'] = (int)$customer_data['total_games_played'];
                    $customer_data['total_hours_played'] = (float)$customer_data['total_hours_played'];

                    echo json_encode(['success' => true, 'data' => $customer_data]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Customer not found.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Error executing query: ' . mysqli_error($conn)]);
            }
            mysqli_stmt_close($stmt);
        } else {
            echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . mysqli_error($conn)]);
        }
        break;

    case 'save_info':
        $gender = $_POST['gender'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $address = $_POST['address'] ?? '';
        $city = $_POST['city'] ?? '';
        $state = $_POST['state'] ?? '';
        $pincode = $_POST['pincode'] ?? '';

        // Basic validation
        if (empty($gender)) {
            echo json_encode(['success' => false, 'message' => 'Gender cannot be empty.']);
            exit();
        }

        $sql = "UPDATE customers SET gender = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?";

        if ($stmt = mysqli_prepare($conn, $sql)) {
            mysqli_stmt_bind_param($stmt, "ssssssi", $gender, $phone, $address, $city, $state, $pincode, $user_id);

            if (mysqli_stmt_execute($stmt)) {
                echo json_encode(['success' => true, 'message' => 'Profile information saved successfully!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to save information: ' . mysqli_error($conn)]);
            }
            mysqli_stmt_close($stmt);
        } else {
            echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . mysqli_error($conn)]);
        }
        break;

    case 'save_settings':
        $setting_type = $_POST['setting_type'] ?? '';

        switch ($setting_type) {
            case 'password':
                $current_password = $_POST['current_password'] ?? '';
                $new_password = $_POST['new_password'] ?? '';

                // In a real app: Fetch current password hash from DB
                $sql_get_hash = "SELECT password_hash FROM customers WHERE id = ?";
                if ($stmt_get_hash = mysqli_prepare($conn, $sql_get_hash)) {
                    mysqli_stmt_bind_param($stmt_get_hash, "i", $user_id);
                    mysqli_stmt_execute($stmt_get_hash);
                    mysqli_stmt_store_result($stmt_get_hash);

                    if (mysqli_stmt_num_rows($stmt_get_hash) == 1) {
                        mysqli_stmt_bind_result($stmt_get_hash, $stored_hash);
                        mysqli_stmt_fetch($stmt_get_hash);

                        // Verify current password
                        // For demonstration: let's assume 'password123' is the correct current password
                        // In real app: use password_verify($current_password, $stored_hash)
                        if ($current_password === 'password123' /* password_verify($current_password, $stored_hash) */) {
                            // Hash the new password
                            $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT); // ALWAYS HASH PASSWORDS

                            $sql_update_password = "UPDATE customers SET password_hash = ? WHERE id = ?";
                            if ($stmt_update_password = mysqli_prepare($conn, $sql_update_password)) {
                                mysqli_stmt_bind_param($stmt_update_password, "si", $new_password_hash, $user_id);
                                if (mysqli_stmt_execute($stmt_update_password)) {
                                    echo json_encode(['success' => true, 'message' => 'Password changed successfully!']);
                                } else {
                                    echo json_encode(['success' => false, 'message' => 'Failed to update password: ' . mysqli_error($conn)]);
                                }
                                mysqli_stmt_close($stmt_update_password);
                            } else {
                                echo json_encode(['success' => false, 'message' => 'Prepare update password statement failed: ' . mysqli_error($conn)]);
                            }
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Incorrect current password.']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'User not found for password change.']);
                    }
                    mysqli_stmt_close($stmt_get_hash);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Prepare get hash statement failed: ' . mysqli_error($conn)]);
                }
                break;

            case 'notifications':
                $enable = ($_POST['enable_notifications'] ?? 0) == '1' ? 1 : 0;
                $email = ($_POST['email_updates'] ?? 0) == '1' ? 1 : 0;
                $sms = ($_POST['sms_alerts'] ?? 0) == '1' ? 1 : 0;

                $sql = "UPDATE customers SET enable_notifications = ?, email_updates = ?, sms_alerts = ? WHERE id = ?";
                if ($stmt = mysqli_prepare($conn, $sql)) {
                    mysqli_stmt_bind_param($stmt, "iiii", $enable, $email, $sms, $user_id);
                    if (mysqli_stmt_execute($stmt)) {
                        echo json_encode(['success' => true, 'message' => 'Notification settings saved!']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Failed to save notifications: ' . mysqli_error($conn)]);
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . mysqli_error($conn)]);
                }
                break;

            case 'language':
                $language = $_POST['language'] ?? 'en';
                $sql = "UPDATE customers SET language = ? WHERE id = ?";
                if ($stmt = mysqli_prepare($conn, $sql)) {
                    mysqli_stmt_bind_param($stmt, "si", $language, $user_id);
                    if (mysqli_stmt_execute($stmt)) {
                        echo json_encode(['success' => true, 'message' => 'Language preference saved!']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Failed to save language: ' . mysqli_error($conn)]);
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . mysqli_error($conn)]);
                }
                break;

            case 'bankUpi':
                $bank_name = $_POST['bank_name'] ?? '';
                $account_number = $_POST['account_number'] ?? '';
                $ifsc_code = $_POST['ifsc_code'] ?? '';
                $upi_id = $_POST['upi_id'] ?? '';

                if (empty($bank_name) || empty($account_number) || empty($ifsc_code)) {
                    echo json_encode(['success' => false, 'message' => 'Bank Name, Account Number, and IFSC Code are required.']);
                    exit();
                }

                $sql = "UPDATE customers SET bank_name = ?, account_number = ?, ifsc_code = ?, upi_id = ? WHERE id = ?";
                if ($stmt = mysqli_prepare($conn, $sql)) {
                    mysqli_stmt_bind_param($stmt, "ssssi", $bank_name, $account_number, $ifsc_code, $upi_id, $user_id);
                    if (mysqli_stmt_execute($stmt)) {
                        echo json_encode(['success' => true, 'message' => 'Bank & UPI details saved!']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Failed to save bank & UPI details: ' . mysqli_error($conn)]);
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . mysqli_error($conn)]);
                }
                break;

            case 'playHistory':
                // This would typically update existing play history data or add new entries.
                // For simplicity, let's just simulate an update of total counts here.
                // In a real system, these would likely come from game events.
                $total_games = (int)($_POST['total_games_played'] ?? 0); // Assuming JS might send current values
                $total_hours = (float)($_POST['total_hours_played'] ?? 0.0);
                $last_played_date = date('Y-m-d H:i:s'); // Current timestamp for last played

                $sql = "UPDATE customers SET total_games_played = ?, total_hours_played = ?, last_played_date = ? WHERE id = ?";
                if ($stmt = mysqli_prepare($conn, $sql)) {
                    mysqli_stmt_bind_param($stmt, "idsi", $total_games, $total_hours, $last_played_date, $user_id);
                    if (mysqli_stmt_execute($stmt)) {
                        echo json_encode(['success' => true, 'message' => 'Play statistics updated!', 'data' => ['lastPlayedDate' => date('Y-m-d')]]); // Return updated date
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Failed to update play history: ' . mysqli_error($conn)]);
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . mysqli_error($conn)]);
                }
                break;

            case 'delete_account':
                // In a real application, you would require password confirmation and likely a soft delete
                $sql = "DELETE FROM customers WHERE id = ?"; // DANGEROUS: CONSIDER SOFT DELETE
                if ($stmt = mysqli_prepare($conn, $sql)) {
                    mysqli_stmt_bind_param($stmt, "i", $user_id);
                    if (mysqli_stmt_execute($stmt)) {
                        session_destroy(); // Destroy session after deletion
                        echo json_encode(['success' => true, 'message' => 'Account deleted successfully.']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Failed to delete account: ' . mysqli_error($conn)]);
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . mysqli_error($conn)]);
                }
                break;

            case 'logout':
                session_destroy();
                echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
                break;

            default:
                echo json_encode(['success' => false, 'message' => 'Unknown setting type.']);
                break;
        }
        break; // End of 'save_settings' case

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
        break;
}

// Close the database connection
mysqli_close($conn);
?>