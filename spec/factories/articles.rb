FactoryBot.define do
  factory :article do

    title { "MyString" }
    content { "MyText" }
    excerpt { "MyText" }
    published_at { Time.current }
    status { "MyString" }

  end
end
