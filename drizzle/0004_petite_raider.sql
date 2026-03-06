CREATE TABLE "record_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "record_photos" ADD CONSTRAINT "record_photos_record_id_service_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."service_records"("id") ON DELETE cascade ON UPDATE no action;