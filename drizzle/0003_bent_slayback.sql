CREATE TABLE "car_ownership_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"user_id" uuid,
	"owner_name" text NOT NULL,
	"owner_email" text NOT NULL,
	"owned_from" timestamp NOT NULL,
	"owned_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "car_ownership_history" ADD CONSTRAINT "car_ownership_history_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_ownership_history" ADD CONSTRAINT "car_ownership_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;