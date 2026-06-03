use crate::db::DbPool;
use crate::models::user::User;

pub async fn create_user(pool: &DbPool, user: &User) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO users (phone, name, stellar_address, created_at) VALUES (?, ?, ?, ?)"
    )
    .bind(&user.phone)
    .bind(&user.name)
    .bind(&user.stellar_address)
    .bind(&user.created_at)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_user(pool: &DbPool, phone: &str) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT phone, name, stellar_address, created_at FROM users WHERE phone = ?")
        .bind(phone)
        .fetch_optional(pool)
        .await
}

pub async fn list_users(pool: &DbPool) -> Result<Vec<User>, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT phone, name, stellar_address, created_at FROM users")
        .fetch_all(pool)
        .await
}
pub async fn delete_user(pool: &DbPool, phone: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM users WHERE phone = ?")
        .bind(phone)
        .execute(pool)
        .await?;
    Ok(())
}
