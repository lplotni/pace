data "aws_kms_secrets" "db" {
  secret {
    name    = "postgres_password"
    payload =
"AQICAHj3pGK3kvjuU2QjfC/NLx1QiGe5X4F2HVmB8WXAXqpj1gFbYumqtgO9l9RzxqWrlf3oAAAAijCBhwYJKoZIhvcNAQcGoHoweAIBADBzBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDNgxBE6SNuugkU5bfgIBEIBGfb3/486mCrRP+CuF9qFoJ/Pw2Hk/P2WF6EtP/+7xJRlPAUoheUqgsH4VfsaNvKcYeNuwZOStSohKsCw7UVhe5gafXoZcPg=="
  }
}
