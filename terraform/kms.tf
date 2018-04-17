data "aws_kms_secret" "db" {
  secret {
    name    = "postgres_password"
    payload = "AQICAHh367S9ZiGnpGl+Boso0I+MRbhEJP80IaetQLE64Jge0wGtFz6LRfRUYK61nnwCamoIAAAAdTBzBgkqhkiG9w0BBwagZjBkAgEAMF8GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMSMK6CafM7DPrlhbIAgEQgDKTPjyQRcHtAd6mzUh7R4wbg70NxeNZfC3rHe7tOIDaIF+1idYo3upKDBpVNrSignr1dA=="
  }
}
